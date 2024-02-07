import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Notifications {
    @ApiProperty({
        example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
        description: 'Notification ID',
        uniqueItems: true
      })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: "Nuevo producto!: Secreto de medianoche. Exquisito perfume con fragancia seductora, lo invitamos a descubrirlo.",
        description: 'Notification Info',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    info: string;

    @ApiProperty({
        example: "secreto_de_medianoche",
        description: "Notification's product",
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    productSlug: string;

    @ApiProperty({
        example: "secreto_de_medianoche.png",
        description: "Notification's product image",
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    image: string;

    //Para el futuro agregar urls externas para promocionar otros negocios
}

 

   