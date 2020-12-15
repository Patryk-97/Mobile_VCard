import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('name=:name&localization=:localization')
  async getCards(@Param('name') name: string, @Param('localization') localization: string): Promise<any> {
    return await this.appService.getCards(name, localization);
  }
}