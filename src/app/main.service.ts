import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class MainService {
  settings = new BehaviorSubject<any>({});
  urlsSource = new BehaviorSubject<any>({});
  addedUrls = this.urlsSource.asObservable();
  deleteAllSource = new BehaviorSubject<any>({});
  deleteAll = this.deleteAllSource.asObservable();
  copyImgUrlSource = new BehaviorSubject<any>({});
  copyImageUrls = this.copyImgUrlSource.asObservable();
  containerCollectiveChangeSource = new BehaviorSubject<any>({});
  copyVideoUrlSource = new BehaviorSubject<any>({});
  copyVideoUrls = this.copyVideoUrlSource.asObservable();
  copyImgVideoUrlSource = new BehaviorSubject<any>({});
  copyImgVideoUrls = this.copyImgVideoUrlSource.asObservable();
  containerCollectiveChange = this.containerCollectiveChangeSource.asObservable();
  imageCollectiveChangeSource = new BehaviorSubject<any>({});
  imageCollectiveChange = this.imageCollectiveChangeSource.asObservable();
  printHtmlCommandSource = new BehaviorSubject<any>({});
  printHtmlCommand = this.printHtmlCommandSource.asObservable();
  printHtmlSource = new BehaviorSubject<any>({tabIndex: 0, html: ''});
  printHtml = this.printHtmlSource.asObservable();
  excutePrintSource = new BehaviorSubject<any>({tabIndex: 0, html: ''});
  excutePrint = this.excutePrintSource.asObservable();
  totalCountSource = new BehaviorSubject<any>({totalCount: 0});
  totalCount = this.totalCountSource.asObservable();
  outputUrlSource = new BehaviorSubject<any>({});
  outputUrls = this.outputUrlSource.asObservable();
  focusImageWidthSource = new BehaviorSubject<any>({});
  focusImageWidth = this.focusImageWidthSource.asObservable();
  imageUrlL2RSource = new BehaviorSubject<any>({});
  imageUrlL2R = this.imageUrlL2RSource.asObservable();
  imageUrlR2LSource = new BehaviorSubject<any>({});
  imageUrlR2L = this.imageUrlR2LSource.asObservable();

  constructor() {
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });
  }

  loadSettings(){
    electron.ipcRenderer.send('loadSettings');
  }

  setAddedUrls(value: any) {
    this.urlsSource.next(value);
  }

  doDeleteAll(value){
    this.deleteAllSource.next(value);
  }

  doCopyImgUrlToClipboard(value) {
    this.copyImgUrlSource.next(value);
  }

  doCopyVideoUrlToClipboard(value) {
    this.copyVideoUrlSource.next(value);
  }

  doCopyImgVideoUrlToClipboard(value) {
    this.copyImgVideoUrlSource.next(value);
  }

  doContainerCollectiveChange(index: any) {
    this.containerCollectiveChangeSource.next(index);
  }

  doImageCollectiveChange(index: any) {
    this.imageCollectiveChangeSource.next(index);
  }

  excutePrintHtml(value) {
    this.excutePrintSource.next(value);
  }

  saveSettings(params){
    electron.ipcRenderer.send('saveSettings', params);
  }

  doPrintHtml(value){
    this.printHtmlCommandSource.next(value);
  }

  setPrintHtml(value){
    this.printHtmlSource.next(value);
  }

  setTotalCount(value){
    this.totalCountSource.next(value);
  }

  setOutputUrls(value: any) {
    this.outputUrlSource.next(value);
  }

  setFocusImageWidth(index: number) {
    this.focusImageWidthSource.next(index);
  }

  setImageUrlR2L(value) {
    this.imageUrlR2LSource.next(value);
  }

  setImageUrlL2R(value) {
    this.imageUrlL2RSource.next(value);
  }

}
