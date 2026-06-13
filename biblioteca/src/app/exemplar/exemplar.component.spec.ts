import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExemplarComponent } from './exemplar.component';

describe('ExemplarComponent', () => {
  let component: ExemplarComponent;
  let fixture: ComponentFixture<ExemplarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExemplarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExemplarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
