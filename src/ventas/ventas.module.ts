import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Venta } from './entities/venta.entity';
import { Email } from 'src/email/entities/email.entity';
import { Product } from 'src/products/entities/product.entity';
import { VentaProducto } from './entities/venta-productos.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
  imports:[
    TypeOrmModule.forFeature([ Venta, Email, Product, VentaProducto ]),
    AuthModule,
    ProductsModule
  ],
})
export class VentasModule {}
