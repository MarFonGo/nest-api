import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';
import { CreateAnuncioDto } from './dto/create-anuncio.dto';
import { UpdateAnuncioDto } from './dto/update-anuncio.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { Anounce } from './entities/anuncio.entity';

@ApiTags('Anounces')
@Controller('anuncios')
export class AnunciosController {
  constructor(private readonly anunciosService: AnunciosService) {}

  @ApiBearerAuth() 
  @Post()
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Anounce created", type: Anounce})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  create(@Body() createAnuncioDto: CreateAnuncioDto) {
    return this.anunciosService.create(createAnuncioDto);
  }

  @Get()
  @ApiResponse({status: 201, description: "Show all anounces", type: Anounce})
  @ApiResponse({status: 400, description: "Bad Request"})
  findAll() {
    return this.anunciosService.findAll();
  }

  @Get(':term')
  @ApiResponse({status: 201, description: "Show anounce selected", type: Anounce})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  async findOne(@Param('term') term: string) {
    return this.anunciosService.findOne(term);
  }

  @ApiBearerAuth() 
  @Patch(':id')
  @ApiResponse({status: 201, description: "Anounce Updated", type: Anounce})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  update(@Param('id') id: string, @Body() updateAnuncioDto: UpdateAnuncioDto) {
    return this.anunciosService.update(id, updateAnuncioDto);
  }
  
  @ApiBearerAuth() 
  @Delete(':id')
  @ApiResponse({status: 201, description: "Anounce Deleted"})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  remove(@Param('id') id: string) {
    return this.anunciosService.remove(id);
  }
}
