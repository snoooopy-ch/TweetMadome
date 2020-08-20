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

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {
    this.twitterContainer = '0';
    this.imageKind = 'twitter';
    this.twitterUrl = 'https://twitter.com/88TcvQhanLysNCd/status/1238277721752350720';
    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      if (value.hasOwnProperty('con')) {
        this.twitterContainer = this.settings.con;
      }
      if (value.hasOwnProperty('pict')) {
        this.imageType = this.settings.pict;
        if (this.imageType > 0){
          this.imageKind = 'custom';
        }else{
          this.imageKind = 'twitter';
        }
      }
      this.cdRef.detectChanges();
    });

    this.subscribers.printHtml = this.mainService.printHtml.subscribe(value => {
      this.outputHtml = value.html;
      this.clipboard.copy(this.outputHtml);
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
    let pict = '0';
    if (this.imageKind === 'custom'){
      pict = this.imageType;
    }
    this.mainService.saveSettings({
      container: this.twitterContainer,
      picture: pict
    })
  }

  btnPrintHtmlClickHandler() {
    let pict = '0';
    if (this.imageKind === 'custom'){
      pict = this.imageType;
    }

    this.mainService.doPrintHtml({
      container: Number(this.twitterContainer),
      imageType: Number(pict),
      imageWidth: this.imageWidth === undefined ? '' : `${this.imageWidth}px`
    });
  }

  btnDeleteAllClickHandler() {
    this.mainService.doDeleteAll({});
  }

  btnAddUrlClickHandler() {
    if(this.twitterUrl.length > 0){
      const twitters = this.twitterUrl.match(/(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/ig);
      if (Array.isArray(twitters) && twitters.length) {
        this.mainService.setAddedUrls(twitters);
      }
      this.twitterUrl = '';
    }
  }
}
