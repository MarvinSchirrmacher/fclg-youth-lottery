import { Injectable } from '@angular/core'
import * as saveAs from 'file-saver';
import Settings from '../../../settings.json'

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  save(): void {
    // TODO: should overwrite settings file, saveAs triggers a download of a new file
    saveAs(JSON.stringify(this), '../../../settings.json')
  }

  get year(): number {
    return Settings.year
  }

  set year(value: number) {
    Settings.year = value
  }

  get emailReferenceTemplate(): string {
    return Settings.emailReferenceTemplate
  }

  set emailReferenceTemplate(value: string) {
    Settings.emailReferenceTemplate = value
  }

  get emailContentTemplate(): string {
    return Settings.emailContentTemplate
  }

  set emailContentTemplate(value: string) {
    Settings.emailContentTemplate = value
  }
}
