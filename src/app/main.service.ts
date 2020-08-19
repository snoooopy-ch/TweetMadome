import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class MainService {
  settings = new BehaviorSubject<any>({});
  urlsSource = new BehaviorSubject<string[]>([]);
  addedUrls = this.urlsSource.asObservable();
  deleteAllSource = new BehaviorSubject<any>({});
  deleteAll = this.deleteAllSource.asObservable();

  constructor() {
    electron.ipcRenderer.on('getSettings', (event, value) => {
      this.settings.next(value);
    });
  }

  loadSettings(){
    electron.ipcRenderer.send('loadSettings');
  }

  setAddedUrls(value: string[]) {
    this.urlsSource.next(value);
  }

  setDeleteAll(value){
    this.deleteAllSource.next(value);
  }

}
