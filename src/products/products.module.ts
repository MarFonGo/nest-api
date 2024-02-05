import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Tag } from './entities/product-tags.entity';
import { ProductsCombinations } from './entities/product-combinations.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import { TagImage } from './entities/tag-images.entity';
import { Anounce } from 'src/anuncios/entities/anuncio.entity';
import { AnounceMedia } from 'src/anuncios/entities/anounce-media.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports:[
    TypeOrmModule.forFeature([ Product, ProductImage, Tag, ProductsCombinations, Venta, TagImage, Anounce, AnounceMedia]),
    AuthModule,
  ],
  exports:[
    ProductsService,
    TypeOrmModule,
  ]
})
export class ProductsModule {}
