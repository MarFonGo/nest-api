import { ApiProperty } from "@nestjs/swagger";
import { Email } from "src/email/entities/email.entity";
import { Product } from "src/products/entities/product.entity";
import { Venta } from "src/ventas/entities/venta.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @ApiProperty({
        example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
        description: 'User ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example: "marlonfontanies@gmail.com",
        description: 'User Email',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    email: string;

    @ApiProperty({
        example: "jahji@HGBDmN;/]ogijzsmbbjf",
        description: 'Encripted User Password',
        uniqueItems: true
    })
    @Column('text',{
        select: false
    })
    password: string;

    @ApiProperty({
        example: "Marlon",
        description: 'User Name',
    })
    @Column('text')
    @Index('user_index', ['fullName'])
    fullName: string;

    @ApiProperty({
        example: "True",
        description: 'User status',
    })
    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @ApiProperty({
        example: "[user, super-user, admin]",
        description: 'Product ID',
        enum: ['user', 'super-user', 'admin']
    })
    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    product: Product;

    @OneToMany(
        () => Email,
        ( email ) => email.user
    )
    emailInfo: Email;
    
    @OneToMany(
        () => Venta,
        ( sale ) => sale.user
    )
    sale: Venta;

    @BeforeInsert()
    CheckFieldsBeforeInsert(){
        this.email = this.email.toLocaleLowerCase().trim();
    }

    @BeforeUpdate()
    CheckFieldsBeforeUpdate(){
        this.email = this.email.toLocaleLowerCase().trim();
    }
}

