import { HttpService, Injectable } from '@nestjs/common';
import { parse } from 'node-html-parser';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async getCards(name: string, localization: string): Promise<string> {
    let query = 'https://panoramafirm.pl/szukaj?k=' + name;
    query += '&l=' + localization;
    const response = await this.httpService.get(query).toPromise();
    const htmlData = response.data;

    return htmlData;
  }

  getCardsFromHtmlData(htmlData: any): Event[] {
    const root = parse(htmlData);
    const activeClasses = root.querySelectorAll('.active');
    let events: Event[] = [];
    activeClasses.forEach(activeClass => {
      if (activeClass.rawTagName === 'td') {
        const activeHyperlink = activeClass.querySelector('.active');
        if (activeHyperlink) {
          let hyperlink = activeHyperlink.getAttribute('href');
          if (hyperlink === 'javascript:void();')
          {
            hyperlink = '';
          }
          const innerBox = activeClass.querySelector('.InnerBox');
          if (innerBox) {
            const eventNameWrapper = (() => {
              const p = innerBox.querySelector('p');
              if (p) {
                return p;
              }
              return innerBox.querySelector('div');
            }) ();
            if (eventNameWrapper) {
              events.push({
                day: parseInt(activeHyperlink.rawText),
                name: eventNameWrapper.rawText,
                hyperlink: hyperlink
              });
            }
          }
        }
      }
    });
    return events;
  }
}
