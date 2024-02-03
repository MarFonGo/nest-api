import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength,IsArray } from "class-validator";

export class CreateAnuncioDto {
    @ApiProperty({
        example: "Calzado Nike",
        description: 'Product Title',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: "Zapatos marca Nike a la moda",
        description: 'Product Info',
        nullable: true
    })
    @IsString()
    @MinLength(1)
    info: string;

    @ApiProperty({
        example: "[secreto_de_medianoche.png]",
        description: 'Anounce Images',
    })
    @IsString({ each:true })
    @IsArray()
    images: string[]; 

    @ApiProperty({
        example: "https://secreto_de_medianoche.mp4",
        description: 'Anounce Video',
    })
    @IsString()
    videos: string; 
}


