import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AnounceMedia } from "./anounce-media.entity";

@Entity()
export class Anounce {
    @ApiProperty({
        example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
        description: 'Anounce ID',
        uniqueItems: true
      })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: "Perfume Aroma de medianoche disponible en la tienda",
        description: 'Anounce Title',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    title: string;

    @ApiProperty({
        example: "Exquisito perfume con fragancia seductora",
        description: 'Anounce Info',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    info: string;

    @ApiProperty({
        example: "secreto_de_medianoche",
        description: "Anounce's product",
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    productSlug: string;

    @ApiProperty({
        example: "{aroma_de_medianoche.png, http://aroma_de_medianoche.mp4}",
        description: 'Anounce Medias',
      })
    @OneToMany(
        ()=> AnounceMedia,
        anounceMedias => anounceMedias.anounce,
        { cascade: true, eager: true }
    )
    medias: AnounceMedia[];
}
