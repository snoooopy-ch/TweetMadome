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
  container: any;
  imageType: any;
  imageWidth: any;
  outputHtml: any;
  settings: any;
  videoWidth1: any;
  videoWidth2: any;
  videoWidth3: any;
  replaceVideoKind: any;
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
  addedUrls1: any;
  addedImgUrls1: any;
  addedVideoUrls1: any;
  isAddTop: boolean;
  notCardImageOutput: boolean;
  notYoutubeText: boolean;
  twitterDefContainer: any;
  twitterDefImage: any;
  appendLargeName: any;
  dougaUrl: any;
  twitList: any;
  focustesting: boolean = true;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {

  }

  ngOnInit(): void {
    this.twitterUrl = 'https://twitter.com/ULoseBlawlStars/status/1315105996767813632;https://twitter.com/Amayuri_Sadaija/status/1315105116974850048;https://twitter.com/Pittology/status/1342511380218470400';
    this.isReplaceUrl = false;
    this.replaceVideoKind = '1';
    this.replaceImgUrlKind = '1';
    this.replacedImgUrl1 = '';
    this.replacedImgUrl2 = '';
    this.replaceAnchorUrlKind = '1';
    this.replacedAnchorUrl1 = '';
    this.replacedAnchorUrl2 = '';
    this.addedUrls = '';
    this.addedImgUrls = '';
    this.addedVideoUrls = '';
    this.addedUrls1 = '';
    this.addedImgUrls1 = '';
    this.addedVideoUrls1 = '';
    this.isAddTop = false;
    this.appendLargeName = '';
    this.notYoutubeText = false;
    this.dougaUrl = '';
    this.twitList = [];

    this.mainService.containerCollectiveChange.subscribe((res) => {
      this.container = res;
    });

    this.mainService.imageCollectiveChange.subscribe((res) => {
      this.imageType = res;
    });

    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      if (value.hasOwnProperty('image_width')) {
        this.imageWidth = this.settings.image_width;
      }
      if (value.hasOwnProperty('video_width')) {
        this.videoWidth1 = this.settings.video_width;
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
      if (value.hasOwnProperty('douga_url')) {
        this.dougaUrl = this.settings.douga_url;
      }

      this.cdRef.detectChanges();
    });

    this.subscribers.printHtml = this.mainService.printHtml.subscribe(value => {
      let imagesList, videosList;
      if (value.images) {
        imagesList = value.images.split('\n');
        imagesList.forEach((image) => {
          if (image != '' && this.addedImgUrls1.indexOf(image) == -1) {
            this.addedImgUrls1 = this.addedImgUrls1 + image + '\n';
          }
        });
      }

      if (value.videos) {
        videosList = value.videos.split('\n');
        videosList.forEach((video) => {
          if (video != '' && this.addedVideoUrls1.indexOf(video) == -1) {
            this.addedVideoUrls1 = this.addedVideoUrls1 + video + '\n';
          }
        })
      }

      this.outputHtml = value.html;
      this.addedImgUrls = value.images;
      this.addedVideoUrls = value.videos;

      switch (value.copyWord) {
        case 'image':
          this.clipboard.copy(this.addedImgUrls);
          break;
        case 'video':
          this.clipboard.copy(this.addedVideoUrls);
          break;
        case 'image-video':
          let contents = '';
          if (this.addedImgUrls !== undefined)
            contents = this.addedImgUrls;
          if (this.addedVideoUrls !== undefined)
            contents += this.addedVideoUrls;

          this.clipboard.copy(contents);
          break;
        case 'html':
          this.clipboard.copy(this.outputHtml);
          break;
        default:
          break;
      }


    });

    this.subscribers.copyImageUrls = this.mainService.copyImageUrls.subscribe(value => {
      if (value.copyWord !== undefined)
        this.btnPrintHtmlClickHandler(value.copyWord);
    });

    this.subscribers.copyVideoUrls = this.mainService.copyVideoUrls.subscribe(value => {
      if (value.copyWord !== undefined)
        this.btnPrintHtmlClickHandler(value.copyWord);
    });

    this.subscribers.copyImgVideoUrls = this.mainService.copyImgVideoUrls.subscribe(value => {
      if (value.copyWord !== undefined)
        this.btnPrintHtmlClickHandler(value.copyWord);
    });

    this.subscribers.excutePrint = this.mainService.excutePrint.subscribe(value => {
      if (value.copyWord !== undefined)
        this.btnPrintHtmlClickHandler(value.copyWord);
    });

    this.subscribers.totalCountStatus = this.mainService.totalCount.subscribe(value => {
      this.totalCount = value.totalCount;
    });

    this.subscribers.addedUrls = this.mainService.outputUrls.subscribe(value => {
      this.twitList = value;
      if (Array.isArray(value) && value.length) {
        let count = 0;
        this.addedUrls = '';
        value.forEach(item => {
          this.addedUrls += (item.url + '\n');
          if (this.addedUrls1.indexOf(item.url) == -1) {
            count ++;
            this.addedUrls1 += (item.url + '\n');
          }
        });
        this.addedUrls += '\n';
        if (count != 0) {
          this.addedUrls1 += '\n';
        }
      }
    });

    this.subscribers.imageUrlL2R = this.mainService.imageUrlL2R.subscribe(value => {
      if (typeof value === 'boolean')
        this.isReplaceUrl = value;
    });
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
    let videoWidth;
    switch (this.replaceVideoKind) {
      case '1':
        videoWidth = this.videoWidth1;
        break;
      case '2':
        videoWidth = this.videoWidth2;
        break;
      case '3':
        videoWidth = this.videoWidth3;
        break;
    }

    this.mainService.saveSettings({
      imageWidth: this.imageWidth,
      videoWidth: videoWidth,
      replaceImgUrl1: this.replacedImgUrl1,
      replaceImgUrl2: this.replacedImgUrl2,
      replaceAnchorUrl1: this.replacedAnchorUrl1,
      replaceAnchorUrl2: this.replacedAnchorUrl2,
      dougaUrl: this.dougaUrl,
    })
  }

  btnPrintHtmlClickHandler(copyWord: string) {
    let pict = '0';
    let replaceImgText = '';
    let replaceAnchorText = '';
    let videoWidth;

    switch (this.replaceVideoKind) {
      case '1':
        videoWidth = this.videoWidth1;
        break;
      case '2':
        videoWidth = this.videoWidth2;
        break;
      case '3':
        videoWidth = this.videoWidth3;
        break;
    }

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
      videoWidth: videoWidth === undefined ? '' : videoWidth,
      isReplaceUrl: this.isReplaceUrl,
      replaceImgText: replaceImgText,
      replaceAnchorText: replaceAnchorText,
      notCardImageOutput: this.notCardImageOutput,
      appendLargeName: this.appendLargeName,
      notYoutubeText: this.notYoutubeText,
      copyWord: copyWord,
      dougaUrl: this.dougaUrl
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
    this.mainService.containerCollectiveChange.subscribe((res) => {
      this.container = res;
    });
  }

  optImageTypeClickHandler(index: any) {
    this.mainService.doImageCollectiveChange(index);
    this.mainService.imageCollectiveChange.subscribe((res) => {
      this.imageType = res;
    });
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

  imageUrlRightChangeClickHandler(value) {
    this.mainService.setImageUrlR2L(value);
    this.cdRef.detectChanges();
  }
}
