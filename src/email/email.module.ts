import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Email } from './entities/email.entity';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports:[
    TypeOrmModule.forFeature([ Email ]),
    AuthModule,
  ],
})
export class EmailModule {}
