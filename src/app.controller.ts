import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): {message: string} {
    const x: number = 9 + 10;
    return {message: `El resultado es ${x} niceone`};
  }
}
