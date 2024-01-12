import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

export class DateDto {

  @ApiProperty({
    type: Date,
    description: 'Fecha de inicio de la busqueda',
    uniqueItems: true
  })
  @IsNotEmpty()
  @IsDateString()
  dateInit: Date;

  @ApiProperty({
    type: Date,
    description: 'Fecha de fin de la busqueda',
    uniqueItems: true
  })
  @IsNotEmpty()
  @IsDateString()
  dateEnd: Date;
  
  @ApiProperty({
    type: Date,
    description: 'Usuarios a buscar',
    uniqueItems: true
  })
  @IsArray()
  @IsOptional()
  usersToFind?:User[];
}
