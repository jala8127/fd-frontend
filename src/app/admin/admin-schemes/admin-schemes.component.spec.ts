import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSchemesComponent } from './admin-schemes.component';

describe('AdminSchemesComponent', () => {
  let component: AdminSchemesComponent;
  let fixture: ComponentFixture<AdminSchemesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSchemesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSchemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
