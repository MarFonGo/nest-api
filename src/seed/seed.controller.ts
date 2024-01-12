import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth-decorator';
import { validRoles } from 'src/auth/interfaces/valid-roles';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @ApiBearerAuth() 
  @Get()
  @ApiResponse({
    status:201,
    description: 'Seed Executed',
  })
  @ApiResponse({status: 403, description: "Forbidden"})
  executeSeed(){
    return this.seedService.runSeed()
  }
}
