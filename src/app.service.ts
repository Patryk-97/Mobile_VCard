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

  private companies: Company[];

  constructor(private httpService: HttpService) {
    this.companies = [];
  }

  async generateHtmlResponse(name: string, localization: string): Promise<any> {
    let query = 'https://panoramafirm.pl/szukaj?k=' + name;
    query += '&l=' + localization;
    const response = await this.httpService.get(query).toPromise();
    const htmlData = response.data;
    this.extractCompanies(htmlData);
    return this.buildHtmlResponse();
  }

  extractCompanies(htmlData: any): void {
    const root = parse(htmlData);
    const scripts = root.querySelectorAll('script');

    scripts.forEach(script => {
      const type = script.getAttribute('type');
      if (type === 'application/ld+json') {
        const company = JSON.parse(script.rawText);
        if (company) {
          this.companies.push({
            name: company.name,
            telephone: company.telephone,
            email: company.email,
            sameAs: company.sameAs,
            address: company.address
          });
        }
      }
    });

    this.companies = this.companies.filter((company, index, arr) => company.name != null);
  }

  getVCard(companyName: string): any {
    //create a new vCard
    const vCard = vCardsJS();

    const company: Company = this.companies.find(company => company.name === companyName);

    if (company) {
      //set properties
      vCard.organization = company.name;
      vCard.email = company.email;
      vCard.workPhone = company.telephone;
      vCard.url = company.sameAs;
      vCard.workAddress.street = company.address.streetAddress;
      vCard.workAddress.city = company.address.addressLocality;
      vCard.workAddress.postalCode = company.address.postalCode;
      vCard.workAddress.countryRegion = company.address.addressCountry;
      
      //get as formatted string
      return vCard.getFormattedString();
    }

    return "";
  }

  buildHtmlResponse(): string {

    let htmlResponse = "<html>\n";
    htmlResponse += "<head>\n";
    htmlResponse += "<style>\n";
    htmlResponse += "table, td {\n";
    htmlResponse += "text-align: center;\n";
    htmlResponse += "border: 1px solid black;\n";
    htmlResponse += "}\n";
    htmlResponse += "td {\n";
    htmlResponse += "padding: 10px;\n";
    htmlResponse += "}\n";
    htmlResponse += "table {\n";
    htmlResponse += "width: 100%;\n";
    htmlResponse += "border-collapse: collapse;\n";
    htmlResponse += "}\n";
    htmlResponse += "</style>\n";
    htmlResponse += "</head>\n";
    htmlResponse += "<body>\n";
    htmlResponse += "<table>\n";
    htmlResponse += "<tr>\n";
    htmlResponse += "<td>Name</td>\n";
    htmlResponse += "<td>Telephone</td>\n";
    htmlResponse += "<td>Email</td>\n";
    htmlResponse += "<td>URL</td>\n";
    htmlResponse += "<td>Generate VCard</td>\n";
    htmlResponse += "</tr>\n";

    this.companies.forEach(company => {
      htmlResponse += "<tr>\n";
      htmlResponse += "<td>" + company.name + "</td>\n";
      htmlResponse += "<td>" + (company.telephone ? company.telephone : "brak") + "</td>\n";
      htmlResponse += "<td>" + (company.email ? company.email : "brak") + "</td>\n";
      htmlResponse += "<td>" + (company.sameAs ? company.sameAs : "brak") + "</td>\n";
      htmlResponse += "<td><form method=\"post\" action=\"/export\">";
      htmlResponse += "<input type=\"hidden\" name=\"name\" value=\"" + company.name + "\">";
      htmlResponse += "<input type=\"submit\" value=\"Generate\"></form></td>\n";
      htmlResponse += "</tr>\n";
    });

    htmlResponse += "</table>\n";
    htmlResponse += "</body>\n";
    htmlResponse += "</html>\n";
    return htmlResponse;
  }
}
