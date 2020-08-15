import {ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {MainService} from '../main.service';
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
  settings: any;

  constructor(private resService: MainService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {
    this.twitterContainer ="0";
    this.imageKind = "twitter";
    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {

  }

  printHtmlTagHandler() {
  }

  btnDeleteAllHandler() {

  }

}
