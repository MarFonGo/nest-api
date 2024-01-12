import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products_combinations'})
export class ProductsCombinations {

  @ApiProperty({
    example: "1",
    description: 'Combination ID',
  })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({
    example: "perfume",
    description: 'Product1 Tag',
    enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
  })
  @PrimaryColumn('text')
  tag1: string;

  @ApiProperty({
    example: "comida",
    description: 'Product2 Tag',
    enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
  })
  @Column('text'
  )
  tag2: string;

  @ApiProperty({
    example: "Perfume de mujer",
    description: 'Product1 Title',
  })
  @Column('text')
  name1: string;

  @ApiProperty({
    example: "Pechuga de Pollo",
    description: 'Product2 Title',
  })
  @Column('text')
  name2: string;

  @ApiProperty({
    example: "20",
    description: 'Cantidad de ventas de ambos productos',
  })
  @Column('integer',{ default: 0 })
  cantidad: number;
  
}

