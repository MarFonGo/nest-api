import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength,IsArray } from "class-validator";

export class CreateAnuncioDto {
    @ApiProperty({
        example: "Seducción enigmática: Nuevo perfume Misterio de Medianoche",
        description: 'Anounce Title',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        example: "¡Despierta tus sentidos con nuestra nueva fragancia!",
        description: 'Anounce Info',
        nullable: true
    })
    @IsString()
    @MinLength(1)
    info: string;

    @ApiProperty({
        example: "secreto_de_medianoche",
        description: 'Product slug',
        nullable: true
    })
    @IsString()
    @MinLength(1)
    productSlug: string;

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


