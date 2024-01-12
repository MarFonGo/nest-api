import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { Product } from "src/products/entities/product.entity";

export class CreateVentaDto {
    @ApiProperty({
        example: "Buena compra",
        description: 'Email Info',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    @IsOptional()
    emailInfo?: string;  

    @ApiProperty({
        example: "10",
        description: 'Cantidad de los productos de la venta',
    })
    @IsInt({each: true})
    @Min(1, { each: true })
    @ArrayMinSize(1)
    @ArrayNotEmpty()
    cantidad: number[];
    
    @ApiProperty({
        type: Product,
        description: 'Uno de los productos de la venta',
        uniqueItems: true
    })
    @IsArray()
    products: Product[];
}
