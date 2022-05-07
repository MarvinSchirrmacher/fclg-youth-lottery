import { Injectable } from '@angular/core'
import SettingsFile from '../../assets/settings.json'
import { Settings } from '../common/settings';

const SETTINGS_KEY = "fclg-youth-lottery-settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public settings: Settings

  constructor() {
    let storedSettings = localStorage.getItem(SETTINGS_KEY)
    this.settings = new Settings((storedSettings ? JSON.parse(storedSettings) : SettingsFile) as Settings)
  }

  save(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
  }

  reset(): void {
    localStorage.removeItem(SETTINGS_KEY)
    this.settings = SettingsFile
  }
}
