import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { Email } from './entities/email.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validRoles } from 'src/auth/interfaces/valid-roles';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService
  ) {}
  
  @ApiBearerAuth() 
  @Post()
  @Auth()
  @ApiResponse({status: 201, description: "Email created", type: Email})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  create(
    @Body() createEmailDto: CreateEmailDto,
    @GetUser() user: User
    ) {
    return this.emailService.create(createEmailDto, user);
  }

  @ApiBearerAuth() 
  @Get()
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Emails sent", type: Email})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findAll(@Query() paginationDto:PaginationDto ) {
    return this.emailService.findAll(paginationDto);
  }

  @ApiBearerAuth() 
  @Get('/user')
  @Auth()
  @ApiResponse({status: 201, description: "Get Emails sent by user", type: Email})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findUserEmails(
    @Query() paginationDto:PaginationDto,
    @GetUser() user: User
    ) {
    return this.emailService.findUserEmails(paginationDto, user);
  }

  @ApiBearerAuth() 
  @Get(':term')
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Get Emails sent by term", type: Email})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  findOne(@Param('term') term: string) {
    return this.emailService.findOne(term);
  }

  @ApiBearerAuth() 
  @Delete(':id')
  @Auth(validRoles.admin)
  @ApiResponse({status: 201, description: "Email deleted"})
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 403, description: "Forbidden"})
  remove(@Param('id') id: string) {
    return this.emailService.remove(id);
  }
}
