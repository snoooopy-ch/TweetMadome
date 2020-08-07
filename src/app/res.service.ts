import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ResItem} from './models/res-item';

const electron = (window as any).require('electron');

@Injectable({
  providedIn: 'root'
})
export class ResService {

  constructor() {

  }
}
