import { Body, Controller, Get, Header, HttpCode, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('name=:name&localization=:localization')
  async generateHtmlResponse(@Param('name') name: string, @Param('localization') localization: string): Promise<any> {
    return await this.appService.generateHtmlResponse(name, localization);
  }

  @Post('export')
  @HttpCode(201)
  @Header('Content-Type', 'text/vcard')
  @Header('Content-Disposition', 'attachment; filename=card.vcf')
  async generateVCard(@Body() body: any): Promise<any> {
    return this.appService.getVCard(body.name);
  }
}