import { Controller, Get, Post, Body, Patch, Param, Res,Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductImage } from 'src/products/entities/product-image.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}
  
  @Get('products/:imageName')
  @ApiResponse({
    status:201,
    description: 'Image of example\n\n![Ejemplo de imagen](http://localhost:3001/files/product/muslo.png)',
    type: ProductImage
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){

    const path = this.filesService.getStaticProduct( imageName )
    res.sendFile( path );
  }

  @Get('anounces/:anounceName')
  @ApiResponse({
    status:201,
    description: 'Image of example\n\n![Ejemplo de imagen](http://localhost:3001/files/anounce/aroma_de_media_noche.png)',
    type: ProductImage
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findAnounceImage(
    @Res() res: Response,
    @Param('anounceName') anounceName: string
  ){

    const path = this.filesService.getStaticAnounce( anounceName )
    res.sendFile( path );
  }

  @ApiBearerAuth() 
  @Post('product')
  @ApiResponse({
    status:201,
    description: 'Image Uploaded\n\n![Ejemplo de imagen](http://localhost:3001/files/product/muslo.png)',
    type: ProductImage
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  @UseInterceptors( FileInterceptor('file',{
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
    )
  {
    if ( !file ){
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureUrl = `${this.configService.get('HOST_NAME')}/files/products/${file.filename}`;
    return {
      fileName: secureUrl
    };
  }
  
  @ApiBearerAuth() 
  @Post('anounce')
  @ApiResponse({
    status:201,
    description: 'Image Uploaded\n\n![Ejemplo de imagen](http://localhost:3001/files/anounce/muslo.png)',
    type: ProductImage
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  @UseInterceptors( FileInterceptor('file',{
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/anounces',
      filename: fileNamer
    })
  }) )
  uploadAnounceImage(
    @UploadedFile() file: Express.Multer.File
    )
  {
    if ( !file ){
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureUrl = `${this.configService.get('HOST_NAME')}/files/anounces/${file.filename}`;
    return {
      fileName: secureUrl
    };
  }
}
