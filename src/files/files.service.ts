import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  getStaticProduct(imageName: string) {
    const path  = join( __dirname, '../../static/products', imageName)    
    if( !existsSync(path) ){
      throw new BadRequestException(`No product found whit image ${ imageName }`)
  
    }
  return path;
  }    

  getStaticAnounce(anounceName: string) {
    const path  = join( __dirname, '../../static/anounces', anounceName)
    if( !existsSync(path) ){
      throw new BadRequestException(`No anounce found whit image ${ anounceName }`)
  
    }
  return path;
  }
}
