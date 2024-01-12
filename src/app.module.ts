import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { EmailModule } from './email/email.module';
import { VentasModule } from './ventas/ventas.module';
import { Venta } from './ventas/entities/venta.entity';
import { VentaProducto } from './ventas/entities/venta-productos.entity';
import { Product } from './products/entities/product.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { Tag } from './products/entities/product-tags.entity';
import { Email } from './email/entities/email.entity';
import { User } from './auth/entities/user.entity';
import { ProductsCombinations } from './products/entities/product-combinations.entity';

@Module({
  imports: [
  ConfigModule.forRoot(),
  TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  autoLoadEntities: true,
  synchronize: true,
  entities: [Venta, VentaProducto, Product, ProductImage, Tag, Email, User, ProductsCombinations],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  }),
  ProductsModule,
  CommonModule,
  SeedModule,
  FilesModule,
  AuthModule,
  MessagesWsModule,
  EmailModule,
  VentasModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
