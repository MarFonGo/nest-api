import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

interface UserInfoResponse {
  data: {
    email: string;
    name: string;
    picture: string;
  }
}
@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,

    private readonly dataSource: DataSource,
  ){}
    
  async googleAuth(code: string) {

    const { google } = require('googleapis');
    const client_id = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URL;
  
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  
    try {
      const tokens = await new Promise((resolve, reject) => {
        oauth2Client.getToken(code, (err, tokens) => {
          if (err) {
            reject('Error al intercambiar el código por un token de acceso');
          }
          resolve(tokens);
        });
      });
      
      oauth2Client.setCredentials(tokens);
  
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const response = await new Promise<UserInfoResponse>((resolve, reject) => {
        oauth2.userinfo.get((err, response) => {
          if (err) {
            reject('Error al obtener la información del perfil del usuario:');
          }
          resolve(response);
        });
      });
  
      const email = response.data.email;
      const name = response.data.name;
      const image = response.data.picture;
      const user = await this.userRepository.findOne({
        where: {email},
        select: { email: true, id: true, password: true, fullName: true}
      });
      if (user){
        delete user.password
        return {
          user,
          image,
          token: this.getJwtToken({id: user.id})}
      }
      else{
        const userSignup = this.userRepository.create( {
          email, 
          fullName: name,
          password: bcrypt.hashSync( email, 10 )
        });
        await this.userRepository.save(userSignup);
        const user = userSignup
        return {
          ...user,
          image,
          token: this.getJwtToken({id: userSignup.id})
        };
      }
    } catch (error) {
      return error;
    }
  }
  
  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const{ password, email, fullName } = createUserDto;
      
      const usuario = await this.userRepository.findOne({
        where: {email},
        select: { email: true, id: true, password: true}
      });

      if(!usuario){
        const user = this.userRepository.create( {
          fullName, 
          email,
          password: bcrypt.hashSync( password, 10 )
        });

        await queryRunner.manager.save( user );
        await queryRunner.commitTransaction();
        queryRunner.release();
        delete user.password;

        return {
          user,
          token: this.getJwtToken({id: user.id})
        };
      }
      else{
        const defaultPassword=usuario.email;
        if (await bcrypt.compare(defaultPassword, usuario.password)){
          usuario.password = bcrypt.hashSync( password, 10 );
          usuario.fullName = fullName;
          await queryRunner.manager.save( usuario );
          await queryRunner.commitTransaction();
          queryRunner.release();
          delete usuario.password;
          const user = usuario;
          return {
            user,
            token: this.getJwtToken({id: usuario.id})
          };
        }
        else{
          throw new UnauthorizedException(`El usuario ya existe en la base de datos`);
        }
      }

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return error;
    };
  }
  
  async login(loginUserDto: LoginUserDto) {
    const {password, email} = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: { email: true, id: true, password: true, fullName: true}
    });
    if (!user || !await bcrypt.compare(password, user.password))
      throw new UnauthorizedException(`Credencials not valid`);
    
    delete user.password;
    return {
      user,
      token: this.getJwtToken({id: user.id})
    };
    
  }
  
  async checkAuthStatus( user: User ){
    
    return {
      user,
      token: this.getJwtToken({id: user.id})
    };
  }

  private getJwtToken( payload: JwtPayload ){
    
    const token = this.jwtService.sign( payload );
    return token;
  }

  private handleDBError(error: any): never{
    if ( error.code === '23505' )
      throw new BadRequestException( error.detail );
    
    throw new InternalServerErrorException(error);
  }
}
