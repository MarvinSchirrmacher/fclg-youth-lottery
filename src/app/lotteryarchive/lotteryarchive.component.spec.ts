import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotteryArchiveComponent } from './lotteryarchive.component';

describe('LotteryArchiveComponent', () => {
  let component: LotteryArchiveComponent;
  let fixture: ComponentFixture<LotteryArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotteryArchiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LotteryArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
