import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity()
export class ProductImage{

    @ApiProperty({
        example: "1",
        description: 'Image ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: "http://localhost:3001/files/product/muslo.png",
        description: 'Image URL',
    })
    @Column('text')
    url: string;
    
    @ManyToOne(
        () => Product,
        ( product ) => product.images,
        {onDelete: 'CASCADE'}
    )
    product: Product;
}