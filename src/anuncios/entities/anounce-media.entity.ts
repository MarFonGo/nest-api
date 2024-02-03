import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Anounce } from "./anuncio.entity";


@Entity()
export class AnounceMedia{

    @ApiProperty({
        example: "1",
        description: 'Media ID',
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        example: "http://localhost:3001/files/product/muslo.png",
        description: 'Image URL',
    })
    @Column('text')
    urlimage: string;

    @ApiProperty({
        example: "http://localhost:3001/files/product/muslo.png",
        description: 'Video URL',
    })
    @Column('text')
    urlvideo: string;
    
    @ManyToOne(
        () => Anounce,
        ( anounce ) => anounce.medias,
        {onDelete: 'CASCADE'}
    )
    anounce: Anounce;
}