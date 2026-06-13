import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditoraComponent } from './editora.component';

describe('EditoraComponent', () => {
  let component: EditoraComponent;
  let fixture: ComponentFixture<EditoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditoraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditoraComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
