import {ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
import { Observable, timer } from 'rxjs';
const electron = (window as any).require('electron');

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css']
})
export class RightPanelComponent implements OnInit, OnDestroy {
  twitterUrl: string;
  private timer;
  public subscribers: any = {};
  private title: any;
  twitterContainer: any;
  imageKind: any;
  imageType: any;
  imageWidth: any;
  outputHtml: any;

  constructor(private resService: ResService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){

  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {

  }

  printHtmlTagHandler() {
  }

  btnDeleteAllHandler() {

  }

}
