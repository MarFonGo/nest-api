import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "./product-tags.entity";


@Entity()
export class TagImage{

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
        () => Tag,
        ( tag ) => tag.images,
        {onDelete: 'CASCADE'}
    )
    tag: Tag;
}