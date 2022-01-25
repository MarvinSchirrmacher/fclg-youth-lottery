import { Injectable } from '@angular/core';
import { map, zip } from 'rxjs';
import { Participation, User } from '../common/data';
import { LotteryDraw } from '../common/lotterydraw';
import { LotteryWin } from '../common/lotterywin';
import { DrawDay, LotteryArchiveService } from './lotteryarchive.service';
import { ParticipationService } from './participation.service';

@Injectable({
  providedIn: 'root'
})
export class LotteryWinService {

  constructor(private lotteryArchive: LotteryArchiveService,
              private participation: ParticipationService) { }

  public subscribe(next: (value: LotteryWin[]) => void): void {
    var allDraws = this.lotteryArchive
        .getAllDrawsOfYear(new Date().getFullYear(), DrawDay.Saturday);
    var allParticipations = this.participation.getAllParticipations();

    zip(allDraws, allParticipations)
      .pipe(map( ([draws, participations]) =>
        draws.map(d => this.createLotteryWin(d, participations))))
      .subscribe(next);
  }

  private createLotteryWin(draw: LotteryDraw, participations: Participation[]): LotteryWin {
    return {
      draw: draw,
      winners: this.determineWinners(draw, participations)
    } as LotteryWin;
  }

  private determineWinners(draw: LotteryDraw, participations: Participation[]): User[] {
    return participations
        .filter(p => p.ticket.number === draw.numbers[0])
        .map(p => p.user);
  }
}
