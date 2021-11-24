import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

export interface LotteryDraw {
  id: number;
  date: Date;
  numbers: number[];
}

interface LotteryData {
  data: LotteryDraw[];
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getLotteryDraws(): Promise<LotteryDraw[]> {
    let url = 'https://johannesfriedrich.github.io/LottoNumberArchive/Lottonumbers_complete.json';
    console.log(url);
    let response = await fetch(url);
    return response.json()['data'];
  }
}
