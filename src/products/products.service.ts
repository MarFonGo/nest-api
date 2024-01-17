import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { Tag } from './entities/product-tags.entity';
import { ProductsCombinations } from './entities/product-combinations.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { TagImage } from './entities/tag-images.entity';

@Injectable()
export class ProductsService {

  private readonly logger= new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    @InjectRepository(TagImage)
    private readonly tagImageRepository: Repository<TagImage>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    @InjectRepository( ProductsCombinations )
    private readonly combinationRepository: Repository<ProductsCombinations>,

    @InjectRepository(Venta )
    private readonly ventaRepository: Repository<Venta>,

    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    
    const{ images=[], ...productDetails } = createProductDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map( image =>
          this.productImageRepository.create({ url: `${process.env.HOST_NAME}/files/products/${image}` }) )
      });
      let image: string;
      
      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.startTransaction();
      const tag= await this.findTag(productDetails.subtag);
      for (image of images){
        const tagImages = this.tagImageRepository.create({
          product: product,
          tag: tag[0], 
          url: `${process.env.HOST_NAME}/files/products/${image}`
        });
        await queryRunner.manager.save( tagImages );
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return {...product, images};

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }

  }

  async findAll(paginationDto:PaginationDto, user) {

    const {limit= 10, offset= 0} = paginationDto;
    
    const products = await this.productRepository.find({
      take:limit,
      skip:offset,
      relations: {
        images: true,
      }
    });

    products.forEach(product=>{
      delete product.number_sales
      if(!user || user.roles.includes('admin')=== false)
        delete product.user
    }) 
    return products.map(product =>({
      ...product,
      images: product.images
    }))
  }

  async findOne(term: string) {

    let product: Product;
    
    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id:term });
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod');

      product= await queryBuilder.where(' UPPER(title)=:title or slug=:slug ',{
        title: term.trim().toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }

    if( !product )
      throw new NotFoundException(`Product ${ term } not found`);
    
    return product;
  }

  async findOnePlain (term: string){
    const{...product}= await this.findOne( term );
    delete product.number_sales;
    return{
      ...product,
      images: product.images
    } 
  }

  async findAllTag (paginationDto:PaginationDto){
    
    const {limit= 10, offset= 0} = paginationDto;
    
    const products = await this.tagRepository.find({
      take:limit,
      skip:offset,
      relations: {
        images: true,
      }
    });

    let product;
    let producto;
    let productos = [];
    for(let i=0; i<products.length; i++){
      let index=i+1;
      product = products[i];
      product.images = [product.images[0]];
      product.subtag = [product.subtag]
      if(productos.length>0){
        let cant =0;
        for (producto of productos){
          if (producto.tag === product.tag){
            cant =cant+1;
          } 
        }
        if(cant===0){
          productos.push(product)
        }
      }
      else{
        product.slug = product.tag
        productos.push(product) 
      } 
      for (index;index<products.length;index++){
        if (products[index].tag === products[i].tag){
          for (product of productos){
            if (product.tag === products[index].tag){
              product.images.push(products[index].images[0]);
              product.subtag.push(products[index].subtag)
            }
          }
        }
      }
     
    }
    return productos.map(product =>({
      ...product,
      images: product.images.map( img=> img.url )
    }))
  }

  async findTag (term: string){
    
    let products: Tag[];
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');

    products= await queryBuilder.where(' UPPER(tag)=:tag or slug=:slug or UPPER(subtag)=:subtag',{
      tag: term.toUpperCase(),
      slug: term.toLowerCase(),
      subtag: term.toUpperCase()
    })
    .leftJoinAndSelect('tag.images', 'tagImages')
    .getMany();

    if( products.length === 0 )
      
      throw new NotFoundException(`Products of ${ term } not found`);

    return products;
  }

  async findByTag (term: string, paginationDto){
    
    const {limit= 9, offset= 0} = paginationDto;
    let products: Product[];
    const queryBuilder = this.productRepository.createQueryBuilder('prod');

    products= await queryBuilder.where(' UPPER(tag)=:tag or UPPER(subtag)=:subtag',{
      tag: term.toUpperCase(),
      subtag: term.toUpperCase()
    })
    .leftJoinAndSelect('prod.images', 'prodImages')
    .addOrderBy("RANDOM()")
    .limit(limit)
    .getMany();

    if( products.length === 0 )
      throw new NotFoundException(`Products of ${ term } not found`);

    products.forEach(product=>{
      delete product.number_sales;
    })
    return products;
  }
  
  async findTopProducts(paginationDto:PaginationDto){

    const {limit= 3, offset= 0} = paginationDto;
    const topProducts = await this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.images', 'prodImages')
    .orderBy("product.number_sales", "DESC")
    .addOrderBy("RANDOM()")
    .limit(limit)
    .getMany();

    let product;
    let products = [];
    for (product of topProducts){
      delete product.number_sales;
      products.push(product);
    };
    return products;
  }

  async findSuggest(term, paginationDto: PaginationDto){
    
    const {limit= 4, offset= 0} = paginationDto;
    const product = await this.findOne(term)
    const query = await this.combinationRepository
    .createQueryBuilder("combination")
    .where("combination.name1 = :name", { name: product.slug })
    .orWhere("combination.name2 = :name", { name: product.slug })
    .orderBy("combination.cantidad", "DESC")
    .addOrderBy("RANDOM()")
    .limit(+limit)
    .getMany();
    let producto: any;
    let products: any[] = [];
    for (producto of query ){

      if (producto.name1 === product.slug)
        producto = await this.findOne(producto.name2);
        delete producto.number_sales;
      if (producto.name2 === product.slug)
        producto = await this.findOne(producto.name1);
        delete producto.number_sales;
      products.push(producto)
    }
    return products;
    
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({id,...toUpdate});
    if ( !product ) throw new NotFoundException(`Product with id: ${id} not found`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {

      if ( images ){
        let img: string;
        await queryRunner.manager.delete( ProductImage, {product: { id } })
        await queryRunner.manager.delete( TagImage, {product: { id } })
        product.images= images.map(image => this.productImageRepository.create({ url: `${process.env.HOST_NAME}/files/products/${image}` }))
        const tag= await this.findTag(toUpdate.subtag);
        for (img of images){
          const tagImages = this.tagImageRepository.create({
            product: product,
            tag: tag[0],
            url: `${process.env.HOST_NAME}/files/products/${img}`
          });
          await queryRunner.manager.save( tagImages ); 
        } 
      } 
      if(user)
        product.user = user;
      if(product.stock !== 0)
        product.isActive=true;
      else
        product.isActive=false;
      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();
      
      return this.findOnePlain( id );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);      
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove( product );
    return 'DELETE COMPLETE';
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');
    const query2 = this.tagRepository.createQueryBuilder('tag');
    const query3 = this.combinationRepository.createQueryBuilder('combination');
    const query4 = this.ventaRepository.createQueryBuilder('venta');
    const query5 = this.tagImageRepository.createQueryBuilder('tag');

    try {
      await query.delete().where({}).execute();
      await query2.delete().where({}).execute();
      await query3.delete().where({}).execute();
      await query4.delete().where({}).execute();
      await query5.delete().where({}).execute();
      return true;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error:any) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
      throw new InternalServerErrorException ( 'Unexpected error, check server logs' ) 
  }
}
