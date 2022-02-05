import { Injectable } from '@angular/core'
import { map, Observable, zip } from 'rxjs'
import { Participation } from '../common/data'
import { LotteryWinner } from '../common/lottery-winner'
import { LotteryDraw } from '../common/lotterydraw'
import { DrawDay, LotteryArchiveService } from './lotteryarchive.service'
import { ParticipationService } from './participation.service'

@Injectable({
  providedIn: 'root'
})
export class LotteryWinService {

  constructor(private lotteryArchive: LotteryArchiveService,
    private participation: ParticipationService) { }

  public observeDraws(): Observable<LotteryDraw[]> {
    return this.lotteryArchive
      .getAllDrawsOfYear(new Date().getFullYear(), DrawDay.Saturday)
  }

  public observeWinners(): Observable<LotteryWinner[]> {
    var allDraws = this.lotteryArchive
      .getAllDrawsOfYear(new Date().getFullYear(), DrawDay.Saturday)
    var allParticipations = this.participation.observeParticipations()

    return zip(allDraws, allParticipations)
      .pipe(map(([draws, participations]) =>
        draws
          .map(d => this.determineWinners(d, participations))
          .reduce((a, b) => a.concat(b))
        ))
  }

  private determineWinners(draw: LotteryDraw, participations: Participation[]): LotteryWinner[] {
    return participations
      .filter(p => this.isInParticipationTerm(p, draw))
      .filter(p => p.ticket.number === draw.numbers[0])
      .map(p => new LotteryWinner(draw.date, p))
  }

  private isInParticipationTerm(p: Participation, d: LotteryDraw): boolean {
    var start = new Date(p.term.start)
    var end = p.term.end ? new Date(p.term.end) : undefined
    var draw = new Date(d.date)

    var afterStart = start.getTime() <= draw.getTime()
    var beforeEnd = end ? end.getTime() >= draw.getTime() : true

    return afterStart && beforeEnd
  }
}
