import { TestBed } from '@angular/core/testing';

import { LotteryarchiveService } from './lotteryarchive.service';

describe('LotteryarchiveService', () => {
  let service: LotteryarchiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotteryarchiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
