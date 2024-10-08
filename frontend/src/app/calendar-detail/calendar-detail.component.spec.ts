import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarDetailComponent } from './calendar-detail.component';

describe('CalendarDetailComponent', () => {
  let component: CalendarDetailComponent;
  let fixture: ComponentFixture<CalendarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
