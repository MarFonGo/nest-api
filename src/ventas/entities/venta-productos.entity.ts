import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities/product.entity";
import { Venta } from "./venta.entity";

@Entity()
export class VentaProducto {
  @ApiProperty({
    example: "1",
    description: 'ID de la venta y el producto',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "10",
    description: 'Cantidad de los productos de la venta',
  })
  @Column('int',{
    default: 0,
  })
  cantidad: number;

  @ManyToOne(
    () => Venta, 
    venta => venta.productos,
    { onDelete: 'CASCADE', eager: true}
  )
  venta: Venta;

  @ManyToOne(
    () => Product, 
    producto => producto.ventas,
    { onDelete: 'CASCADE', eager: true}
  ) 
  producto: Product;
}

   