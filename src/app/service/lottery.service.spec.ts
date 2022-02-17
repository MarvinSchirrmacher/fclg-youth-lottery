import { TestBed } from '@angular/core/testing';

import { DrawDay, LotteryService } from './lottery.service';

describe('LotteryDrawService', () => {
  let service: LotteryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotteryService);
  });

  it('should get all saturday draws of current year', () => {
    var html = service.year(2022).day(DrawDay.Saturday).updateDraws();
    expect(html).toBeTruthy();
  });
});
