import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateEmailDto {
    
    @ApiProperty({
        example: "Buena compra",
        description: 'Email Info',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    info: string;

    @ApiProperty({
        example: "marlonfontanies@gmail.com",
        description: 'Email del usuario',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    userEmail: string;
}
