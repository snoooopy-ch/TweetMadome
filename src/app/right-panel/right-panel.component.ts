import {ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {ResService} from '../res.service';
import { Observable, timer } from 'rxjs';
const electron = (window as any).require('electron');

@Component({
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrls: ['./right-panel.component.css']
})
export class RightPanelComponent implements OnInit, OnDestroy {
  txtDataFilePath = '';
  isResSort = false;
  isMultiAnchor = false;
  isReplaceRes = false;
  hiddenIds: string[];
  tabIndex: number;
  selectCount = 0;
  candi1Count = 0;
  candi2Count = 0;
  candi3Count = 0;
  candi4Count = 0;
  totalCount = 0;
  selectCommand = '';
  settings;
  twitterUrl: string;
  private timer;
  public subscribers: any = {};
  private title: any;
  txtRemarkRes: string;
  txtHideRes: string;
  isContinuousAnchor: any;
  notMoveFutureAnchor: any;
  twitterContainer: any;


  constructor(private resService: ResService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {
    this.hiddenIds = [];
  }

  ngOnInit(): void {

  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){

  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {

  }

  btnLoadSingleFile(filePath) {


  }

  getRemarkRes(){

  }

  getHideRes(){

  }

  /**
   * IDを非表示のID欄から削除し、そのIDのレスを、レス描写エリアに表示します
   * @param id: 非表示のID
   */
  ShowIdHandler(id: string) {

  }

  /**
   * レス描写エリアを移動します
   * @param value: 移動種類
   */
  moveResViewHandler(value: string) {

  }

  btnSelectResHandler() {

  }

  setDefaultPathHandler(dataIndex) {
  }

  printHtmlTagHandler() {
  }

  printAllHtmlTagHandler() {
  }

  saveCurrentRes() {

  }

  saveAppStatus(selectedPath, isMessage){

  }


  loadCurrentRes() {

  }

  btnLoadMultiFiles() {

  }

  btnSetResMenuHandler(value: number) {

  }

  chkResSortHandler() {

  }

  chkMultiAnchorHandler() {
  }

  btnSortResHandler() {

  }
}
