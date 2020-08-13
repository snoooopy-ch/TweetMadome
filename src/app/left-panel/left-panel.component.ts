import {ChangeDetectorRef, Component, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResService} from '../res.service';
import { Title } from '@angular/platform-browser';

const electron = (window as any).require('electron');

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {

  constructor(private resService: ResService, private cdr: ChangeDetectorRef, private titleService: Title,
              private zone: NgZone) {

  }

  ngOnInit(): void {

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){

  }

}
