import { Injectable } from '@angular/core';
import { map, zip } from 'rxjs';
import { Participation } from '../common/data';
import { LotteryDraw } from '../common/lotterydraw';
import { DrawDay, LotteryArchiveService } from './lotteryarchive.service';
import { ParticipationService } from './participation.service';

@Injectable({
  providedIn: 'root'
})
export class LotteryWinService {

  constructor(private lotteryArchive: LotteryArchiveService,
              private participation: ParticipationService) { }

  public subscribe(next: (value: LotteryDraw[]) => void): void {
    var allDraws = this.lotteryArchive
        .getAllDrawsOfYear(new Date().getFullYear(), DrawDay.Saturday);
    var allParticipations = this.participation.getAllParticipations();

    zip(allDraws, allParticipations)
      .pipe(map( ([draws, participations]) =>
        draws.map(d => this.determineWinners(d, participations))))
      .subscribe(next);
  }

  private determineWinners(draw: LotteryDraw, participations: Participation[]): LotteryDraw {
    draw.winners = participations
        .filter(p => this.isInParticipationPeriod(p, draw))
        .filter(p => p.ticket.number === draw.numbers[0]);
    return draw;
  }

  private isInParticipationPeriod(p: Participation, d: LotteryDraw): boolean {
    var start = new Date(p.start);
    var end = p.end ? new Date(p.end) : undefined;
    var draw = new Date(d.date);

    var afterStart = start.getTime() <= draw.getTime();
    var beforeEnd = end ? end.getTime() >= draw.getTime() : true;

    return afterStart && beforeEnd;
  }
}
