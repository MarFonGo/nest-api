import { BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, Repository } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { TagImage } from "./tag-images.entity";

@Entity()
export class Tag {

  @ApiProperty({
    example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
    description: 'Product Tag ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "perfume_de_mujer",
    description: 'Product Slug',
    uniqueItems: true
  })
  @Column('text',{
    unique: true,
    nullable: true
  })
  slug?: string;

  @ApiProperty({
    example: "perfume",
    description: 'Product Subtag',
    enum: ['carnicos', 'lacteos', 'vegetales', 'frutas', 'enlatados']
  })
  @Column('text',{
    nullable: false,
    unique: true
  }
  )
  subtag: string;

  @ApiProperty({
    example: "perfume",
    description: 'Product Tag',
    enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
  })
  @Column('text',{
    nullable: false
  }
  )
  tag: string;

  @ApiProperty({
    example: "[perfume.png]",
    description: 'Product Images',
  })
  @OneToMany(
    ()=> TagImage,
    tagImage => tagImage.tag,
    { cascade: true, eager: true }
  )
  images?: TagImage[];

@BeforeUpdate()
checkSlugUpdate(){
this.slug=this.slug
  .trim()
  .toLocaleLowerCase()
  .replaceAll(' ','_')
  .replaceAll("'",'')
}
}

