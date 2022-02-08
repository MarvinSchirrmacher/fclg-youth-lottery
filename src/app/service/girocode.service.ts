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
  Char = 'CHAR',
  None = ''
}

class EpcQrCode {
  service = EpcService.BCD
  version = EpcVersion.v1
  encoding = EpcEncoding.ISO88591
  transfer = EpcTransfer.SepaCreditTransfer
  currency = Currency.Euro
  dta = EpcDta.None

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
    const nl = "\n"
    let str = this.service.toString() + nl
    str += this.version + nl
    str += this.encoding + nl
    str += this.transfer + nl
    str += this.bic + nl
    str += this.name + nl
    str += this.iban + nl
    str += this.currency + this.amount + nl
    str += this.dta + nl
    str += this.reference + nl
    str += this.purpose

    return str
  }
}