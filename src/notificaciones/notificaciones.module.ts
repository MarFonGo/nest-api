import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import {Notifications} from 'src/notificaciones/entities/notificacione.entity'

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  imports:[
    TypeOrmModule.forFeature([ Notifications]),
    AuthModule,
  ],
  exports:[
    NotificacionesService,
    TypeOrmModule,
  ]
})
export class NotificacionesModule {}
