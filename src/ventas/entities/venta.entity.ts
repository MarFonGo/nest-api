import { CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Email } from "src/email/entities/email.entity";
import { VentaProducto } from "./venta-productos.entity";
import { Product } from "src/products/entities/product.entity";

@Entity()
export class Venta {

  @ApiProperty({
    example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
    description: 'Venta ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(
    () => VentaProducto, 
    ventaProducto => ventaProducto.venta,
    
  )  
  productos: VentaProducto[];
 

  @ManyToOne(
    () => User,
    ( user ) => user.sale,
    { onDelete: 'CASCADE',eager: true}
  )
  user: User; 

  @CreateDateColumn()
  @Index('date_index', ['created_at'])
  created_at: Date;
    
  @ApiProperty({
    type: () => Email,
    description: 'Email sent',
    uniqueItems: true
  })
  @OneToOne(
    () => Email,
    ( email ) => email.venta,
    {cascade: true}
  )
  // @JoinColumn([{ name: "id_emal", referencedColumnName: "ventaId"}]) hacer join para evitar busqueda en caso de DB lenta
  email: Email; 
}

   