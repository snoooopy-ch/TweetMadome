import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitDetailComponent } from './twit-detail.component';

describe('TwitDetailComponent', () => {
  let component: TwitDetailComponent;
  let fixture: ComponentFixture<TwitDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
