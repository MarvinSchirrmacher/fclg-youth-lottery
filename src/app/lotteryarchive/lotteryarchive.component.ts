import { AfterViewInit, Component } from '@angular/core';
import { LotteryArchiveService, LotteryDraw } from '../lotteryarchive.service';

@Component({
  selector: 'app-lotteryarchive',
  templateUrl: './lotteryarchive.component.html',
  styleUrls: ['./lotteryarchive.component.css'],
})
export class LotteryArchiveComponent implements AfterViewInit {
  public lotteryDraws = [] as LotteryDraw[];
  public displayedColumns: string[] = [
    'calendarweek',
    'date',
    'numbers',
    'winningNumber',
  ];

  constructor(private lotteryArchive: LotteryArchiveService) {}

  public ngAfterViewInit(): void {
    console.debug('after view init');
    this.lotteryArchive
      .getAllDrawsOfYear(new Date().getFullYear())
      .subscribe({
        next: draw => this.lotteryDraws = draw,
        error: message => console.error(message)
      });
  }
}
