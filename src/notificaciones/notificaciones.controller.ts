import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { Notifications } from './entities/notificacione.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @ApiBearerAuth() 
  @Post()
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Notification created", type: Notifications})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  create(@Body() createNotificacioneDto: CreateNotificacioneDto) {
    return this.notificacionesService.create(createNotificacioneDto);
  }

  @Get()
  @ApiResponse({status: 201, description: "Show all notifications", type: Notifications})
  @ApiResponse({status: 400, description: "Bad Request"})
  findAll(@Query() paginationDto:PaginationDto) {
    return this.notificacionesService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiResponse({status: 201, description: "Show anounce selected", type: Notifications})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findOne(@Param('term') term: string) {
    return this.notificacionesService.findOne(term);
  }

  @ApiBearerAuth() 
  @Patch(':id')
  @ApiResponse({status: 201, description: "Notification Updated", type: Notifications})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  update(@Param('id') id: string, @Body() updateNotificacioneDto: UpdateNotificacioneDto) {
    return this.notificacionesService.update(id, updateNotificacioneDto);
  }

  @ApiBearerAuth() 
  @Delete(':id')
  @ApiResponse({status: 201, description: "Notification Deleted"})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  @Auth(validRoles.admin)
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(id);
  }
}
