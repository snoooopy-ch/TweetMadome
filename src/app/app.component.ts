import { Component } from '@angular/core';
import {MainService} from './main.service';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ツイート取得';
  settings: any;
  constructor(private mainService: MainService) {
    setTheme('bs4');
    this.mainService.loadSettings();
  }
}
