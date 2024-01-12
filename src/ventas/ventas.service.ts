import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Email } from 'src/email/entities/email.entity';
import { Product } from 'src/products/entities/product.entity';
import { VentaProducto } from './entities/venta-productos.entity';
import { isUUID } from 'class-validator';
import { DateDto } from './dto/date.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class VentasService {

  constructor(

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,

    @InjectRepository(VentaProducto)
    private readonly productVentaRepository: Repository<VentaProducto>,

    @InjectEntityManager()
    private entityManager: EntityManager,
    
    ){}
    
    async create(createVentaDto: CreateVentaDto, user, productsService) {
    try {
      const{ emailInfo, products,cantidad, ...ventaDetails } = createVentaDto;
      const venta = this.ventaRepository.create({
        ...ventaDetails,
        user,
      });

      if (emailInfo) {
        venta.email = this.emailRepository.create({ 
          email: emailInfo,
          user
        });
      }

      let product: Product
      for ( product of createVentaDto.products){
        try {
          await productsService.findOne(product.id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException('Uno de los productos de la compra no se encuentra en el store');
          } 
        }  
      }
      let producto
      let productos =[]
      let total_venta_producto: number = 0;
      let total_venta: number = 0;
      for(let i=0; i<products.length; i++){
        const cant = cantidad[i];
        const prod = await productsService.findOne(products[i].id);
        prod.stock=prod.stock-cant;
        prod.number_sales = prod.number_sales + 1;
        if(prod.stock<0){
          throw new BadRequestException(`Lo sentimos, la cantidad de productos de ${prod.title} que se encuentra en stock no es suficiente para su compra. Compra no realizada`);
        }
        if(prod.stock === 0){
          prod.isActive=false;
        }
        total_venta_producto = prod.price * cant;
        total_venta = total_venta + total_venta_producto;
        producto= {...prod,
          cantidad: cant,
          importe_producto: total_venta_producto,
        }

        delete producto.user;
        delete producto.number_sales;
        productos.push(producto)

        let index=i+1;
        for (index;index<products.length;index++){
          const query = `
          UPDATE products_combinations
          SET cantidad = cantidad + 1
          WHERE (name1 = $1 AND name2 = $2) OR (name1 = $2 AND name2 = $1)
          `;
          await this.entityManager.query(query, [products[index].slug.trim(), products[i].slug.trim()]);
        }
        delete prod.images;
        delete prod.user;
        productsService.update(prod.id, prod, user=null)
      }
      await this.ventaRepository.save(venta)
      await this.InsertProductoVenta(products, venta, cantidad)
      return{
        venta, 
        products: productos, 
        total_venta};

    } catch (error) {
        await this.handleDBExceptions(error);
    }

  }
  async findAll(){

    const queryBuilder = await this.ventaRepository
    .createQueryBuilder('venta')
    .leftJoinAndSelect('venta.user', 'usuario')
    .leftJoinAndSelect('venta.email', 'email') 
    .getMany(); 
  
    return this.getProducts(queryBuilder);
  }
  
  async findOne(term: string, user:User) {
    
    if(user.fullName === term || user.email === term || user.id === term || user.roles.includes('admin')){
      const queryBuilder = await this.ventaRepository
      let ventas
      if (isUUID(term)){
        ventas = await queryBuilder
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.user', 'usuario')
        .leftJoinAndSelect('venta.email', 'email') 
        .where(' venta.id=:id or usuario.id=:userId ',{
          id: term,
          userId: term,
        })
        .getMany();
      }
        else{
          ventas = await queryBuilder
          .createQueryBuilder('venta')
          .leftJoinAndSelect('venta.user', 'usuario')
          .leftJoinAndSelect('venta.email', 'email') 
          .where(' usuario.email=:email or UPPER(usuario.fullName)=:name',{
            email: term,
            name: term.toUpperCase()
          })
          .getMany();
        }
      if( ventas.length === 0 )
        throw new NotFoundException(`venta with ${ term } not found`);

      return this.getProducts(ventas)
    }
    else{
      throw new UnauthorizedException('El usuario no esta autorizado a realizar esa busqueda');
    }
  }

  async findByDate(dateDTo: DateDto, user){

    const {dateInit, dateEnd, usersToFind} = dateDTo;

    if (user.roles.includes('admin')===false){ 
      return await this.getSalesByDate(user.id,dateInit,dateEnd);
    }
   else{
      if (usersToFind){let ventasUser: Venta[] = []; 
        let ventas: any[] =[];
        for(user of usersToFind){
          ventasUser = await this.getSalesByDate(user,dateInit,dateEnd);
          ventas.push(ventasUser);
        }
        return ventas;
      }
      else{
        return this.getSalesByDate(null, dateInit, dateEnd);
      }  
   }
  }
  
  async update(id: string, updateVentaDto: UpdateVentaDto,user) {
    const venta = await this.findVentabyId(id)
    const nuevaVenta = {
      ...venta,
      ...updateVentaDto,
      user
    };
    this.deleteProductoVenta(venta);
    await this.ventaRepository.save(nuevaVenta);
    this.InsertProductoVenta(nuevaVenta.products, nuevaVenta, updateVentaDto.cantidad)
    return nuevaVenta; 
  }

  async remove(id: string) {
    const venta = await this.findVentabyId(id)
    this.deleteProductoVenta(venta);
    await this.ventaRepository.delete(venta.id);
    return 'DELETE COMPLETE';
  }
  
  private async handleDBExceptions(error:any) {
    if ( error.code === '23502' )
      throw new BadRequestException(error.detail);   
    if (error instanceof BadRequestException)
      throw new BadRequestException(`${error.message}`);
  }

  private async deleteProductoVenta(venta){
    try {
      const ventaProductos = await this.productVentaRepository.createQueryBuilder('ventaProductos')  
      .leftJoinAndSelect('ventaProductos.producto', 'producto')
      .leftJoinAndSelect('ventaProductos.venta', 'venta')
      .where(' venta.id=:id ',{
        id: venta.id
      })
      .getMany()
      if(!ventaProductos)
        throw new BadRequestException('venta not found');
      let ventaProducto
      for (ventaProducto of ventaProductos){
        await this.productVentaRepository.delete(ventaProducto)
      }  
    } catch (error) {
        await this.handleDBExceptions(error)
    }
    
  }

  private async InsertProductoVenta(products:Product[], venta, cantidad){
      for( let i =0; i<products.length; i++){
        const productoVenta = this.productVentaRepository.create({
          producto: products[i],
          venta: venta,
          cantidad: cantidad[i]
        })
        await this.productVentaRepository.save(productoVenta);
      }
  }

  private async findVentabyId(id: string){
    const queryBuilder = await this.ventaRepository
    const venta = await queryBuilder
    .createQueryBuilder('venta')
    .leftJoinAndSelect('venta.user', 'usuario')
    .leftJoinAndSelect('venta.email', 'email') 
    .where(' venta.id=:id ',{
      id: id,
    })
    .getOne();
    if(!venta)
     throw new BadRequestException(`Venta not found`) 
    return venta
  }

  private async getProducts(ventas){
    let venta: Venta
    let ventaProducto: any[] = []
    for (venta of ventas){
      const queryBuilder2 = await this.productVentaRepository
      .createQueryBuilder('ventaProductos')  
      .leftJoinAndSelect('ventaProductos.producto', 'producto')
      .leftJoinAndSelect('ventaProductos.venta', 'venta')
      .leftJoinAndSelect('producto.images', 'prodImages')
      .where(' venta.id=:id ',{
        id: venta.id
      })
      .getMany()
      let importe_producto: number = 0;
      let total_venta: number = 0;
      let product: any
      let products: any[] = []
      queryBuilder2.map(query =>{       
        delete query.producto.number_sales;
        importe_producto = query.producto.price * query.cantidad;
        total_venta = total_venta + importe_producto;          
        product = {
          ...query.producto,
          cantidad: query.cantidad,
          importe_producto
        }
        products.push(product)
        return products
      })
      ventaProducto.push({
        venta,
        products,
        total_venta
      })
    }
    return ventaProducto;
  }

  private async getSalesByDate(userId, dateInit, dateEnd):Promise<Venta[]>{
    
    const queryBuilder = await this.ventaRepository
    const ventas = queryBuilder.createQueryBuilder('venta')
    .leftJoinAndSelect('venta.user', 'usuario')
    .leftJoinAndSelect('venta.email', 'email') 
    .where(' venta.created_at>=:init and venta.created_at<=:end',{
      init: dateInit,
      end: dateEnd,
    });
    if (userId) {
      ventas.andWhere('venta.user = :user', { user: userId });
    }
    const sales = await ventas.getMany()
    return this.getProducts(sales);
    
  }
}
