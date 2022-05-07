export interface EmailTemplate {
  reference: string
  content: string
}

export class Settings {
  year: number
  emailTemplate: EmailTemplate = {
    reference: "",
    content: ""
  }

  constructor(object: Partial<Settings>) {
    this.year = object.year ? object.year : new Date().getFullYear()
    this.emailTemplate = object.emailTemplate ? {
      reference: object.emailTemplate.reference,
      content: object.emailTemplate.content
    } : {
      reference: '',
      content: ''
    }
  }
}