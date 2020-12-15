import { HttpService, Injectable } from '@nestjs/common';
import { parse } from 'node-html-parser';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async getCards(name: string, localization: string): Promise<any> {
    let query = 'https://panoramafirm.pl/szukaj?k=' + name;
    query += '&l=' + localization;
    const response = await this.httpService.get(query).toPromise();
    const htmlData = response.data;
    const cards = this.getCardsFromHtmlData(htmlData);
    return cards;
  }

  getCardsFromHtmlData(htmlData: any): Event[] {
    const root = parse(htmlData);
    const scripts = root.querySelectorAll('script');

    let arr = [];
    scripts.forEach(script => {
      const type = script.getAttribute('type');
      if (type === 'application/ld+json') {
        arr.push(script.rawText);
      }
    });
    return arr;
  }
}
