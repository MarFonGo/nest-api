import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNumber, IsPositive, 
    IsOptional, IsInt, IsIn, IsArray } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        example: "Calzado Nike",
        description: 'Product Title',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: "7500",
        description: 'Product Price',
        default: 0
    })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({
        example: "Zapatos marca Nike a la moda",
        description: 'Product Info',
        nullable: true
    })
    @IsString()
    @MinLength(1)
    @IsOptional()
    info?: string;

    @ApiProperty({
        example: "25",
        description: 'Product Stock',
        default: 0
    })
    @IsInt()
    @IsPositive()
    stock: number;

    @ApiProperty({
        example: "calzado_nike",
        description: 'Product Slug',
        uniqueItems: true
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        example: "calzados",
        description: 'Product Tag',
        nullable: false,
        enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
    })
    @IsString()
    @IsIn(['perfumes', 'comida', 'tech', 'ropa', 'calzados'])
    tag: string; 

    @ApiProperty({
        example: "calzados",
        description: 'Product Tag',
        nullable: false,
        enum: ['carnicos', 'lacteos', 'vegetales', 'frutas', 'enlatados']
    })
    @IsString()
    subtag: string; 

    @ApiProperty({
        example: "[nike.png]",
        description: 'Product Images',
    })
    @IsString({ each:true })
    @IsArray()
    @IsOptional()
    images?: string[]; 
}
