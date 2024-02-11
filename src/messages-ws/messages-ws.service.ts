import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { Repository } from 'typeorm';

interface ConnectedClients{
    [id: string]: {
        socket: Socket,
        user?: User
    }
}

@Injectable()
export class MessagesWsService {
    
    private connectedClients: ConnectedClients = {}
    
    constructor(
        private readonly notificationService: NotificacionesService,
        
        @InjectRepository( User )
        private readonly userRepository: Repository<User>
    ){}
    async registerClient( client: Socket, userId?: string){
        
        if(userId){
            const user = await this.userRepository.findOneBy({ id: userId });
            if ( !user ) throw new Error('User not Found');
            if ( !user.isActive ) throw new Error('User not Active');
    
            this.connectedClients[client.id] = {
                socket: client,
                user: user
            };  
        }
        else{            
            this.connectedClients[client.id] = {
                socket: client
            };
        }
    }

    removeClient( clientId: string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[]{
        return Object.keys( this.connectedClients );
    }

    getUserFullName( socketId: string ){
        return this.connectedClients[socketId].user.fullName;
    }

    async getNotifications(){
        const notifications = await this.notificationService.findAll({limit: 5, offset: 0})
        return notifications;
    }
}
