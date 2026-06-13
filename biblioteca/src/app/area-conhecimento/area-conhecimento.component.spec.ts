import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaConhecimentoComponent } from './area-conhecimento.component';

describe('AreaConhecimentoComponent', () => {
  let component: AreaConhecimentoComponent;
  let fixture: ComponentFixture<AreaConhecimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaConhecimentoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaConhecimentoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
