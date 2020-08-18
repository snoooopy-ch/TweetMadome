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

  constructor(private resService: MainService, private cdRef: ChangeDetectorRef,
              private zone: NgZone) {

  }

  ngOnInit(): void {
    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;
      this.cdRef.detectChanges();
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
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
