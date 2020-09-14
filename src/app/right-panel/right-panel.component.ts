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
  videoWidth: any;
  isReplaceUrl: boolean;
  replaceUrlKind: any;
  replacedUrl1: any;
  replacedUrl2: any;
  totalCount: number;
  addedUrls: any;
  isAddTop: boolean;
  notCardImageOutput: boolean;
  twitterDefContainer: any;
  twitterDefImage: any;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {
    this.twitterContainer = '0';
    this.imageKind = 'twitter';
    this.twitterUrl = '';
    this.isReplaceUrl = false;
    this.replaceUrlKind = '1';
    this.replacedUrl1 = '';
    this.replacedUrl2 = '';
    this.addedUrls = '';
    this.isAddTop = false;

    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      if (value.hasOwnProperty('image_width')) {
        this.imageWidth = this.settings.image_width;
      }
      if (value.hasOwnProperty('video_width')) {
        this.videoWidth = this.settings.video_width;
      }
      if (value.hasOwnProperty('replace_image_url1')) {
        this.replacedUrl1 = this.settings.replace_image_url1;
      }
      if (value.hasOwnProperty('replace_image_url2')) {
        this.replacedUrl2 = this.settings.replace_image_url2;
      }
      if (value.hasOwnProperty('con')) {
        this.twitterDefContainer = this.settings.con;
      }
      if (value.hasOwnProperty('pict')) {
        this.twitterDefImage = this.settings.pict;
      }

      this.cdRef.detectChanges();
    });

    this.subscribers.printHtml = this.mainService.printHtml.subscribe(value => {
      this.outputHtml = value.html;
      this.clipboard.copy(this.outputHtml);

    });

    this.subscribers.totalCountStatus = this.mainService.totalCount.subscribe(value => {
      this.totalCount = value.totalCount;
    });

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
    this.subscribers.totalCountStatus.unsubscribe();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    // let pict = '0';
    // if (this.imageKind === 'custom'){
    //   pict = this.imageType;
    // }
    this.mainService.saveSettings({
      imageWidth: this.imageWidth,
      videoWidth: this.videoWidth,
      replaceUrl1: this.replacedUrl1,
      replaceUrl2: this.replacedUrl2
    })
  }

  btnPrintHtmlClickHandler() {
    let pict = '0';
    if (this.imageKind === 'custom'){
      pict = this.imageType;
    }

    let replaceText = '';

    if(this.replaceUrlKind === '1'){
      replaceText = this.replacedUrl1;
    }else if (this.replaceUrlKind === '2'){
      replaceText = this.replacedUrl2;
    }

    this.mainService.doPrintHtml({
      container: Number(this.twitterContainer),
      imageType: Number(pict),
      imageWidth: this.imageWidth === undefined ? '' : this.imageWidth,
      videoWidth: this.videoWidth === undefined ? '' : this.videoWidth,
      isReplaceUrl: this.isReplaceUrl,
      replaceText: replaceText,
      notCardImageOutput: this.notCardImageOutput
    });
  }

  btnDeleteAllClickHandler() {
    this.mainService.doDeleteAll({});
    this.addedUrls = '';
  }

  btnAddUrlClickHandler() {
    if(this.twitterUrl.length > 0){
      const filteredTwitters = this.twitterUrl.match(/(https?:\/\/(mobile\.)*twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/ig);
      if (Array.isArray(filteredTwitters) && filteredTwitters.length) {
        this.mainService.setAddedUrls({twitters: filteredTwitters, isAddTop: this.isAddTop, con:this.twitterDefContainer, pict:this.twitterDefImage});
        this.addedUrls += filteredTwitters.join('\n') + '\n';
      }
      this.twitterUrl = '';
    }
  }

  optImageTypeClickHandler() {
    this.imageKind = 'custom';
  }

  optImageKindClickHandler() {
    this.imageType = '0';
  }
}
