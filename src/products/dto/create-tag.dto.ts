import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNumber, IsPositive, 
    IsOptional, IsInt, IsIn, IsArray } from "class-validator";

export class CreateTagDto {

    @ApiProperty({
        example: "carnicos",
        description: 'Product Slug',
        uniqueItems: true
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        example: "calzados",
        description: 'Product Tag',
        enum: ["perfumes", 'comida', 'tech', 'ropa', 'calzados']
    })
    @IsString()
    @IsIn(['perfumes', 'comida', 'tech', 'ropa', 'calzados'])
    tag: string; 

    @ApiProperty({
        example: "carnicos",
        description: 'Product Subtag',
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
