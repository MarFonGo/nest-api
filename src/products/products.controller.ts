import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { User } from 'src/auth/entities/user.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { Tag } from './entities/product-tags.entity';
import { AuthIfExist } from 'src/auth/decorators/auth-if-exist-decorator';
import { GetUserIfExist } from 'src/ventas/decorators/get-user-ifexist.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth() 
  @Post()
  @Auth(validRoles.admin, validRoles.superUser)
  @ApiResponse({status: 201, description: "Product created", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @UseGuards(AuthIfExist)
  @Get()
  @ApiResponse({status: 201, description: "Show all products", type: Product})
  @ApiResponse({status: 403, description: "Forbidden"})
  findAll( @Query() paginationDto:PaginationDto, @GetUserIfExist() user:User ) {
    return this.productsService.findAll(paginationDto, user);
  }
  
  @Get('one/:term')
  @ApiResponse({status: 201, description: "Show product selected", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  async findOne(@Param('term') term: string) {
    const product = await this.productsService.findOnePlain(term);
    delete product.number_sales;
    return product;
  }

  @Get('suggest/:term')
  @ApiResponse({status: 201, description: "Show suggestion for other products related to the product selected", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findSuggest(@Param('term') term: string, @Query() paginationDto: PaginationDto) {
    return this.productsService.findSuggest(term, paginationDto);
  }

  @Get('tag')
  @ApiResponse({status: 201, description: "Show all tags of products", type: Tag})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findAllTag(@Query() paginationDto:PaginationDto) {
    return this.productsService.findAllTag(paginationDto);
  }

  @Get('tag/:term')
  @ApiResponse({status: 201, description: "Show specific tag", type: Tag})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findTag(@Param('term') term: string) {
    return this.productsService.findTag(term);
  }

  @Get('bytag/:term')
  @ApiResponse({status: 201, description: "Show all products of a chosen tag", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findByTag(@Param('term') term: string, @Query() paginationDto:PaginationDto) {
    return this.productsService.findByTag(term, paginationDto);
  }
  
  @Get('top')
  @ApiResponse({status: 201, description: "Show most popular products", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findTop(@Query() paginationDto: PaginationDto) {
    return this.productsService.findTopProducts(paginationDto);
  }

  @ApiBearerAuth() 
  @Patch(':id')
  @ApiResponse({status: 201, description: "Product Updated", type: Product})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin, validRoles.superUser)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
    ) {
    return this.productsService.update( id, updateProductDto,user);
  }

  @ApiBearerAuth() 
  @Delete(':id')
  @ApiResponse({status: 201, description: "Product Deleted"})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin, validRoles.superUser)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
