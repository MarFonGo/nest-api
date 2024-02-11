import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [AuthModule,NotificacionesModule]
})
export class MessagesWsModule {}
