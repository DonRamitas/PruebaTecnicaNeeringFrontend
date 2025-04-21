import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryAddPage } from './category-add.page';

describe('CategoryAddPage', () => {
  let component: CategoryAddPage;
  let fixture: ComponentFixture<CategoryAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
