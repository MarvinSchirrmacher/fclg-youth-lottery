import { TestBed } from '@angular/core/testing';

import { LotteryWinService } from './lotterywin.service';

describe('WinningsService', () => {
  let service: LotteryWinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotteryWinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
