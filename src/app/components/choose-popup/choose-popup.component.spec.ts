import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChoosePopupComponent } from './choose-popup.component';

describe('ChoosePopupComponent', () => {
  let component: ChoosePopupComponent;
  let fixture: ComponentFixture<ChoosePopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ChoosePopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChoosePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
