import {ChangeDetectorRef, Component, HostListener, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MainService} from '../main.service';
import { Title } from '@angular/platform-browser';
import {TwitItem} from "../models/twit-item";
import {CdkDragDrop, CdkDragStart} from "@angular/cdk/drag-drop";

const electron = (window as any).require('electron');

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {

  public subscribers: any = {};
  settings: any;
  twitList: TwitItem[];
  draggable: number;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef,
              private zone: NgZone) {

  }

  ngOnInit(): void {

    // load the setting parameters from the setting.ini file
    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      this.cdRef.detectChanges();
    });

    // get the Twit Url array from the right panel
    this.subscribers.twitUrls = this.mainService.addedUrls.subscribe((value) =>{
      this.addTwitUrls(value);
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.twitUrls.unsubscribe();
  }

  /**
   * add Twit items from the string array of Twit Url to Twit list
   * @param pTwitUrls: Twit Url array
   */
  async addTwitUrls(pTwitUrls: string[]) {
    for (const twitter of pTwitUrls) {
      const item = new TwitItem();
      const twitURL = twitter.slice(1, -1);
      const response = await fetch('https://publish.twitter.com/oembed?url=' + twitURL);
      if (response.ok) {
        const data = await response.json();
        item.content = data.html;
        // content = content.replace(/<script async src="https:\/\/platform\.twitter\.com\/widgets\.js" charset="utf-8"><\/script>\n+/gi, '');
      }
    }
  }

  vsTwitUpdateHandler($event: any[]) {

  }

  vsTwitDragStartedHandler($event: CdkDragStart, twitItem: any) {

  }

  getDraggable(index: number) {
    return this.draggable !== index;
  }

  setDraggable(index: number, $event: any) {
    if ($event){
      this.draggable = index;
    }else{
      this.draggable = -1;
    }
  }

  vsTwitDropHandler($event: CdkDragDrop<any[]>) {

  }
}
