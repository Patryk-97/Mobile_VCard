import { HttpService, Injectable } from '@nestjs/common';
import { parse } from 'node-html-parser';
var vCardsJS = require('vcards-js');

type Address = {
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressCountry: string;
}

type Company = {
  name: string;
  telephone: string;
  email: string;
  sameAs: URL;
  address: Address;
}

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async getCards(name: string, localization: string): Promise<any> {
    let query = 'https://panoramafirm.pl/szukaj?k=' + name;
    query += '&l=' + localization;
    const response = await this.httpService.get(query).toPromise();
    const htmlData = response.data;
    const companiesData = this.getCompaniesData(htmlData);

    let htmlResponse = "<html>\n";
    htmlResponse += "<body>\n";
    htmlResponse += "<table>\n";

    htmlResponse += "</table>\n";
    htmlResponse += "</body>\n";
    htmlResponse += "</html>\n";
  }

  getCompaniesData(htmlData: any): Company[] {
    const root = parse(htmlData);
    const scripts = root.querySelectorAll('script');

    let companies: Company[] = [];
    scripts.forEach(script => {
      const type = script.getAttribute('type');
      if (type === 'application/ld+json') {
        const company = JSON.parse(script.rawText);
        companies.push({
          name: company.name,
          telephone: company.telephone,
          email: company.email,
          sameAs: company.sameAs,
          address: company.address
        });
      }
    });
    return companies;
  }

  getVCard(companyData: Company): any {
    //create a new vCard
    const vCard = vCardsJS();

    //set properties
    vCard.organization = companyData.name;
    vCard.email = companyData.email;
    vCard.workPhone = companyData.telephone;
    vCard.url = companyData.sameAs;
    vCard.workAddress.street = companyData.address.streetAddress;
    vCard.workAddress.city = companyData.address.addressLocality;
    vCard.workAddress.postalCode = companyData.address.postalCode;
    vCard.workAddress.countryRegion = companyData.address.addressCountry;
    
    //get as formatted string
    return vCard.getFormattedString();
  }
}
