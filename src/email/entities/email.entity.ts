import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Venta } from "src/ventas/entities/venta.entity";

@Entity()
export class Email {

  @ApiProperty({
    example: "f1e580e7-7bf5-445b-addb-a6a957f3b211",
    description: 'Email ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "La compra fue muy buena",
    description: 'Email Info',
    nullable: true
  })
  @Column('text',{
    nullable: true
  })
  @Index('email_index', ['email'])
  email: string;

  
  @ApiProperty({
    type: () => User,
    description: 'User who wrote email',
    uniqueItems: true
  })
  @ManyToOne(
    () => User,
    ( user ) => user.emailInfo,
    { onDelete: 'CASCADE',eager: true }
  )
  user: User; 

  @OneToOne(
    () => Venta,
    ( venta ) => venta.email,
    {onDelete:'CASCADE', eager: true}
  )
  @JoinColumn()
  venta: Venta; 
    
}

   