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
  htmlTag: string;
  private timer;
  public subscribers: any = {};
  private title: any;
  txtRemarkRes: string;
  txtHideRes: string;
  isContinuousAnchor: any;
  notMoveFutureAnchor: any;
  sortCommand: any;


  constructor(private resService: ResService, private cdRef: ChangeDetectorRef, private clipboard: Clipboard) {
    this.hiddenIds = [];
  }

  ngOnInit(): void {
    this.subscribers.LoadHiddenIds = this.resService.LoadHiddenIds.subscribe((hiddenIds) => {
      this.hiddenIds = hiddenIds;
      this.cdRef.detectChanges();
    });

    this.subscribers.settings = this.resService.settings.subscribe((value) => {
      this.settings = value;

      if (this.settings.AutoSave){
        const min = Number(this.settings.min);
        this.timer = timer(2000, min * 60000);
        // subscribing to a observable returns a subscription object
        this.subscribers.statusTimer =  this.timer.subscribe(t => {
          if (this.title !== undefined) {
            this.saveAppStatus(null, false);
          }
        });
      }
      this.txtDataFilePath = this.settings.dataPath;
      this.isReplaceRes = this.settings.isReplaceRes;
      this.isMultiAnchor = this.settings.isMultiAnchor;
      this.isContinuousAnchor = this.settings.isContinuousAnchor;
      this.notMoveFutureAnchor = this.settings.notMoveFutureAnchor;
      this.isResSort = this.settings.isResSort;
      if (this.settings.chuui !== undefined) {
        this.txtRemarkRes = this.settings.chuui;
        this.txtHideRes = this.settings.hihyouji;
      }
      this.cdRef.detectChanges();
    });

    this.subscribers.selectedTab = this.resService.selectedTab.subscribe((value ) => {
      this.tabIndex = value.tabIndex;
      this.selectCount = value.select;
      this.candi1Count = value.candi1;
      this.candi2Count = value.candi2;
      this.candi3Count = value.candi3;
      this.candi4Count = value.candi4;
      this.totalCount = value.totalCount;
      this.title = value.title;
    });

    this.subscribers.selectedRes = this.resService.selectedRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.selectCount = value.select;
        this.candi1Count = value.candi1;
        this.candi2Count = value.candi2;
        this.candi3Count = value.candi3;
        this.candi4Count = value.candi4;
        this.cdRef.detectChanges();
      }
    });

    this.subscribers.totalRes = this.resService.totalRes.subscribe((value) => {
      if (this.tabIndex === value.tabIndex){
        this.totalCount = value.totalCount;
        if (value.title !== undefined){
          this.title = value.title;
        }
      }
    });

    this.subscribers.printHtml = this.resService.printHtml.subscribe( (value) => {
      if (this.tabIndex === value.tabIndex){
        this.htmlTag = value.html;
        this.clipboard.copy(this.htmlTag);
      }
    });

    this.subscribers.status = this.resService.status.subscribe((value) => {
      if (this.tabIndex === value.tabIndex) {
        this.isResSort = value.data.isResSort;
        this.isReplaceRes = value.data.isReplaceRes;
        this.isMultiAnchor = value.data.isMultiAnchor;
        this.txtDataFilePath = value.data.txtPath;
      }
    });
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.LoadHiddenIds.unsubscribe();
    this.subscribers.settings.unsubscribe();
    this.subscribers.selectedTab.unsubscribe();
    this.subscribers.selectedRes.unsubscribe();
    this.subscribers.totalRes.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
    this.subscribers.status.unsubscribe();
    this.subscribers.statusTimer.unsubscribe();
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHandler(event) {
    this.resService.saveSettings(this.txtDataFilePath, this.txtRemarkRes, this.txtHideRes,
      this.isResSort, this.isMultiAnchor, this.isReplaceRes, this.isContinuousAnchor, this.notMoveFutureAnchor);
  }

  btnLoadSingleFile(filePath) {

    const remarkRes = this.getRemarkRes();
    const hideRes = this.getHideRes();
    this.resService.loadRes(filePath, this.isResSort, this.isMultiAnchor, this.isReplaceRes, this.isContinuousAnchor,
      this.notMoveFutureAnchor, remarkRes, hideRes);
  }

  getRemarkRes(){
    let remarkRes = this.txtRemarkRes;
    if (remarkRes.endsWith(';')){
      remarkRes = remarkRes.substr(0, remarkRes.length - 1);
    }
    remarkRes = remarkRes.replace(/;/gi, '|');
    return remarkRes;
  }

  getHideRes(){
    let hideRes = this.txtHideRes;
    if (hideRes.endsWith(';')){
      hideRes = hideRes.substr(0, hideRes.length - 1);
    }
    hideRes = hideRes.replace(/;/gi, '|');
    return hideRes;
  }

  /**
   * IDを非表示のID欄から削除し、そのIDのレスを、レス描写エリアに表示します
   * @param id: 非表示のID
   */
  ShowIdHandler(id: string) {
    let exists = false;
    for (let i = 0; i < this.hiddenIds.length; i++){
      if (this.hiddenIds[i] === id){
        this.hiddenIds.splice(i, 1);
        exists = true;
        break;
      }
    }
    if (exists){
      this.cdRef.detectChanges();
      this.resService.setHiddenIds(this.hiddenIds);
    }
  }

  /**
   * レス描写エリアを移動します
   * @param value: 移動種類
   */
  moveResViewHandler(value: string) {
    this.resService.setMoveRes({
      tabIndex: this.tabIndex,
      moveKind: value
    });
  }

  btnSelectResHandler() {
    this.resService.setSelectCommand({
      tabIndex: this.tabIndex,
      command: this.selectCommand,
      token: true,
    });
    this.selectCommand = '';
  }

  setDefaultPathHandler(dataIndex) {
    this.txtDataFilePath = this.settings.defaultPath[dataIndex];
  }

  printHtmlTagHandler() {
    this.resService.setPrintCommand({tabIndex: this.tabIndex, token: true});
  }

  printAllHtmlTagHandler() {
    this.resService.setPrintAllCommand({ token: true});
  }

  saveCurrentRes() {
    electron.remote.dialog.showSaveDialog(null, {title: 'レス状態保存',
      filters: [{ name: '状態保存パイル', extensions: ['txt'] }]}).then(result => {
      if (!result.canceled){
        let filePath;
        if (!result.filePath.endsWith('.txt')){
          filePath = result.filePath + '.txt';
        }else{
          filePath = result.filePath;
        }
        this.saveAppStatus(filePath, true);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  saveAppStatus(selectedPath, isMessage){
    this.resService.setSaveResStatus({
      tabIndex: this.tabIndex,
      filePath: selectedPath,
      autoFilePath: this.settings.autoSavePath,
      isAllTabSave: selectedPath === null ? this.settings.all_tab_save : false,
      isResSort: this.isResSort,
      isMultiAnchor: this.isMultiAnchor,
      isReplaceRes: this.isReplaceRes,
      txtPath: this.txtDataFilePath,
      remarkRes: this.txtRemarkRes,
      hideRes: this.txtHideRes,
      token: true,
      showMessage: isMessage
    });
  }


  loadCurrentRes() {
    electron.remote.dialog.showOpenDialog(null, {title: 'レス状態復元',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '復元パイル', extensions: ['txt'] }]}).then(result => {
      if (!result.canceled){
        this.resService.loadStatus(result.filePaths);
      }
    });
  }

  btnLoadMultiFiles() {
    electron.remote.dialog.showOpenDialog(null, {title: 'dat直接読み込み',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Datパイル', extensions: ['dat'] }]}).then(async result => {
      if (!result.canceled){
        const remarkRes = this.getHideRes();
        const hideRes = this.getHideRes();
        this.resService.loadMultiRes(result.filePaths, this.isResSort, this.isMultiAnchor, this.isReplaceRes, this.isContinuousAnchor,
          this.notMoveFutureAnchor, remarkRes, hideRes);
      }
    });
  }

  btnSetResMenuHandler(value: number) {
    this.resService.setResMenu({
      tabIndex: this.tabIndex,
      token: true,
      resMenu: value
    });
  }

  chkResSortHandler() {
    this.isMultiAnchor = this.isResSort && this.isMultiAnchor;
    this.isContinuousAnchor = this.isResSort && this.isMultiAnchor && this.isContinuousAnchor;
  }

  chkMultiAnchorHandler() {
    this.isContinuousAnchor = this.isMultiAnchor && this.isContinuousAnchor;
  }

  btnSortResHandler() {
    if (this.sortCommand === 'num-sort') {
      this.resService.setSort({
        tabIndex: this.tabIndex,
        token: true
      });
    }
    this.sortCommand = '';
  }
}
