import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotterydataComponent } from './lotterydata.component';

describe('LotterydataComponent', () => {
  let component: LotterydataComponent;
  let fixture: ComponentFixture<LotterydataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotterydataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LotterydataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
