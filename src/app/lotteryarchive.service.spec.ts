import { TestBed } from '@angular/core/testing';

import { LotteryArchiveService } from './lotteryarchive.service';

describe('LotteryarchiveService', () => {
  let service: LotteryArchiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotteryArchiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
