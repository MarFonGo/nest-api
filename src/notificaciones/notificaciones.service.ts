import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from './entities/notificacione.entity';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class NotificacionesService {
  
  private readonly logger= new Logger('NotificationsService')

  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepository: Repository<Notifications>,

    private readonly dataSource: DataSource
  ){}
  async create(createNotificacioneDto: CreateNotificacioneDto) {
    const {image, ...notificationDetails} = createNotificacioneDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const notification = this.notificationRepository.create({
        ...notificationDetails,
        image: `${process.env.HOST_NAME}/files/products/${image}`
      })
      await queryRunner.manager.save( notification );
      await queryRunner.commitTransaction();
      await queryRunner.startTransaction();
      return notification;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit= 10, offset= 0} = paginationDto;
    const notifications = await this.notificationRepository.find({
      take:limit,
      skip:offset,
    });
    return notifications
  }

  async findOne(term:string) {
    let notification: Notifications;
    
    if ( isUUID(term) ){
      notification = await this.notificationRepository.findOneBy({ id:term });
    }else{
      const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

      notification= await queryBuilder.where(' UPPER(title)=:title',{
        title: term.trim().toUpperCase(),
      })
      .getOne();
    }

    if( !notification )
      throw new NotFoundException(`Notification ${ term } not found`);
    
    return notification;
  }

  async update(id: string, updateNotificacioneDto: UpdateNotificacioneDto) {
    const image = `${process.env.HOST_NAME}/files/products/${updateNotificacioneDto.image}`
    const notification = await this.notificationRepository.preload({id, ...updateNotificacioneDto, image});

    if ( !notification ) throw new NotFoundException(`Notification with id: ${id} not found`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save( notification );
      await queryRunner.commitTransaction();
      await queryRunner.release();      
      return notification;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error); 
    }
  }

  async remove(id: string) {
    const notification = await this.findOne( id );
    await this.notificationRepository.remove( notification );
    return 'DELETE COMPLETE';
  }
  private handleDBExceptions(error:any) {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error)
      throw new InternalServerErrorException ( 'Unexpected error, check server logs' ) 
  }
}
