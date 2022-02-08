import { Injectable } from "@angular/core"

export interface GiroCodeOptions {
  name: string,
  iban: string,
  bic?: string,
  amount: number,
  purpose: string
}

@Injectable({
  providedIn: 'root'
})
export class GiroCodeService {
  public createQrCodeData(options: GiroCodeOptions): string {
    var code = new EpcQrCode(options)
    return code.toString()
  }
}

enum EpcService {
  BCD = 'BCD'
}

enum EpcVersion {
  v1 = '001',
  v2 = '002'
}

enum EpcEncoding {
  UTF8 = 1,
  ISO88591 = 2
}

enum EpcTransfer {
  SepaCreditTransfer = 'SCT'
}

enum Currency {
  Euro = 'EUR'
}

enum EpcDta {
  Char = 'CHAR'
}

class EpcQrCode {
  service = EpcService.BCD
  version = EpcVersion.v1
  encoding = EpcEncoding.ISO88591
  transfer = EpcTransfer.SepaCreditTransfer
  currency = Currency.Euro
  dta = EpcDta.Char

  name: string
  iban: string
  bic?: string
  amount?: number
  purpose = ''

  reference = ''
  hint = ''

  constructor(options: GiroCodeOptions) {
    this.name = options.name.trim()
    this.iban = options.iban.replace(' ', '').trim()
    this.bic = options.bic ? options.bic.trim() : ''
    this.amount = options.amount
    this.purpose = options.purpose.trim().replace('\n', ' ').substring(0, 140)
  }

  public toString = (): string => {
    const sep = "\n";
    let s = this.service.toString();
    s += sep + this.version;
    s += sep + this.encoding;
    s += sep + this.transfer;
    s += sep + this.bic;
    s += sep + this.name;
    s += sep + this.iban;
    s += sep + this.currency + this.amount;
    s += sep + this.dta;
    s += sep + this.reference;
    s += sep + this.purpose;

    console.debug(s)

    return s;
  }
}