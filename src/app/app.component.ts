import { Component } from '@angular/core';
import {ResService} from './res.service';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'スレ編集';
  settings: any;
  constructor(private resService: ResService) {
    setTheme('bs4');
    this.resService.loadSettings();
  }
}
