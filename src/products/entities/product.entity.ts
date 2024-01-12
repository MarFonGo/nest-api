import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne,OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { VentaProducto } from "src/ventas/entities/venta-productos.entity";

@Entity()
export class Product {

  @ApiProperty({
    example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
    description: 'Product ID',
    uniqueItems: true
  })
  @Index('id_index', ['id'])
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "Perfume de mujer",
    description: 'Product Title',
    uniqueItems: true
  })
  @Column('text',{
    unique: true
  })
  title: string;

  @ApiProperty({
    example: "100",
    description: 'Product Price',
    default: 0
  })
  @Column('float',{
    default: 0
  })
  price: number;

  @ApiProperty({
    example: "Perfume de calidad de escencias florales",
    description: 'Product Info',
    nullable: true
  })
  @Column('text',{
    nullable: true
  })
  info: string;
  
  @ApiProperty({
    example: "20",
    description: 'Product Stock',
    default: 0
  })
  @Column('int',{
    default: 0
  })
  stock: number;

  @ApiProperty({
    example: "perfume_de_mujer",
    description: 'Product Slug',
    uniqueItems: true
  })
  @Column('text',{
    unique: true
  })
  slug: string;

  @ApiProperty({
    example: "perfume",
    description: 'Product Tag',
    enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
  })
  @Column('text'
  )
  @Index('tag_index', ['tag'])
  tag: string;

  @ApiProperty({
    example: "tenis",
    description: 'Product Subtag',
    enum: ['carnicos', 'lacteos', 'vegetales', 'frutas', 'enlatados']
  })
  @Column('text'
  )
  subtag: string;

  @ApiProperty({
    example: "20",
    description: 'Product Sales',
    default: 0
  })
  @Column('int',{
    default: 0
  })
  number_sales: number;

  @ApiProperty({
    example: "[perfume.png]",
    description: 'Product Images',
  })
  @OneToMany(
    ()=> ProductImage,
    productImage => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @ApiProperty({
    example: "True",
    description: 'Product status',
  })
  @Column('bool', {
      default: true
  })
  isActive: boolean;
  
  @OneToMany(
    () => VentaProducto,   
    ventaProducto => ventaProducto.producto,
    {cascade: true}
  )
  ventas: VentaProducto[];
  
  @ApiProperty({
    type: User,
    description: 'User who created product',
    uniqueItems: true
  })
  @ManyToOne(
    () => User,
    ( user ) => user.product,
    { eager: true }
  )
  user: User

  @BeforeInsert()
  checkSlugInsert(){
  if (!this.slug ){
    this.title = this.title.trim();
    this.slug=this.title;
  }
  this.slug=this.slug
    .trim()
    .toLowerCase()
    .replaceAll(' ','_')
    .replaceAll("'",'')
  }

  @BeforeUpdate()
  checkSlugUpdate(){
  this.slug=this.slug
    .trim()
    .toLocaleLowerCase()
    .replaceAll(' ','_')
    .replaceAll("'",'')
  }
  
}

