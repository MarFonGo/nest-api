import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { User } from 'src/auth/entities/user.entity';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { GetUserIfExist } from './decorators/get-user-ifexist.decorator';
import { AuthIfExist } from 'src/auth/decorators/auth-if-exist-decorator';
import { ProductsService } from 'src/products/products.service';
import { DateDto } from './dto/date.dto';
import { VentaInterface } from 'src/auth/interfaces/venta.interface';

@ApiTags('Sales')
@Controller('ventas')
export class VentasController {
  constructor(
    private readonly ventasService: VentasService,
    
    private readonly productsService: ProductsService
    ) {}
  
  @UseGuards(AuthIfExist)
  @Post()
  @ApiResponse({status: 201, description: "Sale created", type: VentaInterface})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  create(
    @Body() createProductDto: CreateVentaDto,
    @GetUserIfExist() user: User
  ) {
    return this.ventasService.create(createProductDto, user, this.productsService);
  }

  @ApiBearerAuth() 
  @Get()
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Get all sales", type: VentaInterface})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findAll() {
    return this.ventasService.findAll();
  }

  @ApiBearerAuth() 
  @Auth()
  @ApiResponse({status: 201, description: "Get Sales by term", type: VentaInterface})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Get('/byterm/:term')
  findOne(
    @Param('term') term: string,
    @GetUser() user: User
    ) {
    return this.ventasService.findOne(term, user);
  }

  @ApiBearerAuth() 
  @Auth()
  @ApiResponse({status: 201, description: "Get sales by date", type: VentaInterface})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Get('/bydate')
  findByDate(
    @Query() dateDTo: DateDto,
    @GetUser() user: User) {
    return this.ventasService.findByDate(dateDTo, user);
  }

  @ApiBearerAuth() 
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Sale updated", type: VentaInterface})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateVentaDto: UpdateVentaDto,
    @GetUser() user: User) {
    return this.ventasService.update(id, updateVentaDto,user);
  }
  
  @ApiBearerAuth() 
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Sale deleted"})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ventasService.remove(id);
  }
}
