import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeModalComponent } from './scheme-modal.component';

describe('SchemeModalComponent', () => {
  let component: SchemeModalComponent;
  let fixture: ComponentFixture<SchemeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
