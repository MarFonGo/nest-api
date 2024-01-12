import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorators';
import { User } from './entities/user.entity';
import { Auth } from './decorators/auth-decorator';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserWithToken } from '../auth/interfaces/user-whit-Token.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @ApiResponse({
    status:201,
    description: 'Sign Up User with Google',
    type: UserWithToken
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  async googleAuth(@Body('code') code: string) {
    return this.authService.googleAuth(code);
  }

  @Post('signup')
  @ApiResponse({
    status:201,
    description: 'Sign Up User',
    type: UserWithToken
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiBearerAuth() 
  @Post('login')
  @ApiResponse({
    status:201,
    description: 'Login User',
    type: UserWithToken,
  })
  @ApiResponse({status: 400, description: "Bad Request"})
  @ApiResponse({status: 401, description: "Unauthorized"})
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @ApiBearerAuth() 
  @Get('check-auth-status')
  @ApiResponse({
    status:201,
    description: 'Check User',
    type: UserWithToken
  })
  @ApiResponse({status: 401, description: "Unauthorized"})
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus( user )
  }
}
