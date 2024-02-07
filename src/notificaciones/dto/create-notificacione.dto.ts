import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength,IsArray } from "class-validator";

export class CreateNotificacioneDto {

    @ApiProperty({
        example: "Nuevo producto!: Secreto de medianoche. Exquisito perfume con fragancia seductora, lo invitamos a descubrirlo.",
        description: 'Notification Info',
        nullable: false
    })
    @IsString()
    @MinLength(1)
    info: string;

    @ApiProperty({
        example: "secreto_de_medianoche",
        description: 'Product slug',
        nullable: false
    })
    @IsString()
    @MinLength(1)
    productSlug: string;

    @ApiProperty({
        example: "secreto_de_medianoche.png",
        description: 'Notification Image',
    })
    @IsString()
    image: string; 

}
