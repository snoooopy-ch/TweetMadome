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
  printHtmlCommandSource = new BehaviorSubject<any>({});
  printHtmlCommand = this.printHtmlCommandSource.asObservable();
  printHtmlSource = new BehaviorSubject<any>({tabIndex: 0, html: ''});
  printHtml = this.printHtmlSource.asObservable();
  totalCountSource = new BehaviorSubject<any>({totalCount: 0});
  totalCount = this.totalCountSource.asObservable();

  constructor() {
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });
  }

  loadSettings(){
    electron.ipcRenderer.send('loadSettings');
  }

  // saveTest(data){
  //   electron.ipcRenderer.send('saveTest', data);
  // }

  setAddedUrls(value: any) {
    this.urlsSource.next(value);
  }

  doDeleteAll(value){
    this.deleteAllSource.next(value);
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
}
