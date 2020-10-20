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
  imageType: any;
  imageWidth: any;
  outputHtml: any;
  settings: any;
  videoWidth: any;
  isReplaceUrl: boolean;
  replaceImgUrlKind: any;
  replacedImgUrl1: any;
  replacedImgUrl2: any;
  replaceAnchorUrlKind: any;
  replacedAnchorUrl1: any;
  replacedAnchorUrl2: any;
  totalCount: number;
  addedUrls: any;
  addedImgUrls: any;
  addedVideoUrls: any;
  isAddTop: boolean;
  notCardImageOutput: boolean;
  notYoutubeText: boolean;
  twitterDefContainer: any;
  twitterDefImage: any;
  appendLargeName: any;
  focustesting: boolean = true;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {
    this.twitterContainer = '0';
    this.twitterUrl = '';
    this.isReplaceUrl = false;
    this.replaceImgUrlKind = '1';
    this.replacedImgUrl1 = '';
    this.replacedImgUrl2 = '';
    this.replaceAnchorUrlKind = '1';
    this.replacedAnchorUrl1 = '';
    this.replacedAnchorUrl2 = '';
    this.addedUrls = '';
    this.addedImgUrls = '';
    this.addedVideoUrls = '';
    this.isAddTop = false;
    this.appendLargeName = '';
    this.notYoutubeText = false;

    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      if (value.hasOwnProperty('image_width')) {
        this.imageWidth = this.settings.image_width;
      }
      if (value.hasOwnProperty('video_width')) {
        this.videoWidth = this.settings.video_width;
      }
      if (value.hasOwnProperty('replace_image_url1')) {
        this.replacedImgUrl1 = this.settings.replace_image_url1;
      }
      if (value.hasOwnProperty('replace_image_url2')) {
        this.replacedImgUrl2 = this.settings.replace_image_url2;
      }
      if (value.hasOwnProperty('replace_anchor_url1')) {
        this.replacedAnchorUrl1 = this.settings.replace_anchor_url1;
      }
      if (value.hasOwnProperty('replace_anchor_url2')) {
        this.replacedAnchorUrl2 = this.settings.replace_anchor_url2;
      }
      if (value.hasOwnProperty('con')) {
        this.twitterDefContainer = this.settings.con;
      }
      if (value.hasOwnProperty('pict')) {
        this.twitterDefImage = this.settings.pict;
      }
      if (value.hasOwnProperty('large')) {
        this.appendLargeName = this.settings.large;
      }

      this.cdRef.detectChanges();
    });

    this.subscribers.printHtml = this.mainService.printHtml.subscribe(value => {
      this.outputHtml = value.html;
      this.addedImgUrls = value.images;
      this.addedVideoUrls = value.videos;
      this.clipboard.copy(this.outputHtml);

    });

    this.subscribers.copyImageUrls = this.mainService.copyImageUrls.subscribe(value => {
      if (this.addedImgUrls !== undefined)
        this.clipboard.copy(this.addedImgUrls);
    });

    this.subscribers.copyVideoUrls = this.mainService.copyVideoUrls.subscribe(value => {
      if (this.addedVideoUrls !== undefined)
        this.clipboard.copy(this.addedVideoUrls);
    });

    this.subscribers.copyImgVideoUrls = this.mainService.copyImgVideoUrls.subscribe(value => {
      let copyText = '';
      
      if (this.addedImgUrls !== undefined)
        copyText = this.addedImgUrls;
      if (this.addedVideoUrls !== undefined)
        copyText += this.addedVideoUrls;
        
      this.clipboard.copy(copyText);
    });

    this.subscribers.totalCountStatus = this.mainService.totalCount.subscribe(value => {
      this.totalCount = value.totalCount;
    });

    this.subscribers.addedUrls = this.mainService.outputUrls.subscribe(value => {
      if (Array.isArray(value) && value.length) {
        this.addedUrls = '';
        value.forEach(item => {
          this.addedUrls += (item.url + '\n');
        });
        this.addedUrls += '\n';
      }
    });

    this.subscribers.excutePrint = this.mainService.excutePrint.subscribe(value => {
      if (value === 1)
        this.btnPrintHtmlClickHandler();
    })
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
    this.subscribers.totalCountStatus.unsubscribe();
    this.subscribers.copyImageUrls.unsubscribe();
    this.subscribers.copyVideoUrls.unsubscribe();
    this.subscribers.copyImgVideoUrls.unsubscribe();
    this.subscribers.excutePrint.unsubscribe();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.mainService.saveSettings({
      imageWidth: this.imageWidth,
      videoWidth: this.videoWidth,
      replaceImgUrl1: this.replacedImgUrl1,
      replaceImgUrl2: this.replacedImgUrl2,
      replaceAnchorUrl1: this.replacedAnchorUrl1,
      replaceAnchorUrl2: this.replacedAnchorUrl2
    })
  }

  btnPrintHtmlClickHandler() {
    let pict = '0';
    let replaceImgText = '';
    let replaceAnchorText = '';

    if(this.replaceImgUrlKind === '1'){
      replaceImgText = this.replacedImgUrl1;
    }else if (this.replaceImgUrlKind === '2'){
      replaceImgText = this.replacedImgUrl2;
    }

    if(this.replaceAnchorUrlKind === '1'){
      replaceAnchorText = this.replacedAnchorUrl1;
    }else if (this.replaceAnchorUrlKind === '2'){
      replaceAnchorText = this.replacedAnchorUrl2;
    }

    this.mainService.doPrintHtml({
      imageType: Number(pict),
      imageWidth: this.imageWidth === undefined ? '' : this.imageWidth,
      videoWidth: this.videoWidth === undefined ? '' : this.videoWidth,
      isReplaceUrl: this.isReplaceUrl,
      replaceImgText: replaceImgText,
      replaceAnchorText: replaceAnchorText,
      notCardImageOutput: this.notCardImageOutput,
      appendLargeName: this.appendLargeName,
      notYoutubeText: this.notYoutubeText,
    });
  }

  btnDeleteAllClickHandler() {
    this.mainService.doDeleteAll({});
    this.addedUrls = '';
    this.addedImgUrls = '';
    this.addedVideoUrls = '';
  }

  containerCollectiveSelectionHandler(index: any) {
    this.mainService.doContainerCollectiveChange(index);
  }

  optImageTypeClickHandler(index: any) {
    this.mainService.doImageCollectiveChange(index);
  }

  btnAddUrlClickHandler() {
    if(this.twitterUrl.length > 0){
      const filteredTwitters = this.twitterUrl.match(/(https?:\/\/(mobile\.)*twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/ig);
      if (Array.isArray(filteredTwitters) && filteredTwitters.length) {
        this.mainService.setAddedUrls({twitters: filteredTwitters, isAddTop: this.isAddTop, con:this.twitterDefContainer, pict:this.twitterDefImage});
      }
      this.twitterUrl = '';
    }
  }
}
