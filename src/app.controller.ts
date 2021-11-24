import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
    // let value = "";
    // this.appService.getLotteryDraws()
    //   .then(response => value = response.toString())
    //   .catch(error => console.log('failed to get lottery draws: ' + error));
    // return value;
  }
}
