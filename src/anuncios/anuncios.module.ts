import { Module } from '@nestjs/common';
import { AnunciosService } from './anuncios.service';
import { AnunciosController } from './anuncios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AnounceMedia } from './entities/anounce-media.entity';
import { Anounce } from './entities/anuncio.entity';

@Module({
  controllers: [AnunciosController],
  providers: [AnunciosService],
  imports:[
    TypeOrmModule.forFeature([ Anounce, AnounceMedia]),
    AuthModule,
  ],
  exports:[
    AnunciosService,
    TypeOrmModule,
  ]
})
export class AnunciosModule {}
