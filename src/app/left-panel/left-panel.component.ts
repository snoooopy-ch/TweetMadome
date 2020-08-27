import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {MainService} from '../main.service';
import {TwitItem} from "../models/twit-item";
import {CdkDragDrop, CdkDragStart, moveItemInArray} from "@angular/cdk/drag-drop";
import {SimpleItem} from "../models/pair-item";
import {VirtualScrollerComponent} from "ngx-virtual-scroller";
import {Hotkey, HotkeysService} from "angular2-hotkeys";

declare const require: any;
export const Encoding = require('encoding-japanese');
export const emojiUnicode = require("emoji-unicode");
export const emoji = require('emoji-node');

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css'],
})
export class LeftPanelComponent implements OnInit, OnDestroy {

  public subscribers: any = {};
  @ViewChild('listContainer') listContainer: VirtualScrollerComponent;
  settings: any;
  twitList: TwitItem[];
  conList: SimpleItem[];
  picList: SimpleItem[];
  draggable: number;
  private selectedTwitIndex: number;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef,
              private zone: NgZone, private hotkeysService: HotkeysService) {

  }

  ngOnInit(): void {
    this.twitList = [];

    // load the setting parameters from the setting.ini file
    this.subscribers.settings = this.mainService.settings.subscribe((value) => {
      this.settings = value;
      this.conList = [];
      this.picList = [];
      if (value.hasOwnProperty('view_container1')) {
        for (let i = 1; i < 7; i++) {
          const conItem = new SimpleItem();
          conItem.label = this.settings[`view_container${i}`];
          conItem.value = i.toString();
          this.conList.push(conItem);
        }
      }
      if (value.hasOwnProperty('view_pict1')) {
        for (let i = 1; i < 6; i++) {
          const picItem = new SimpleItem();
          picItem.label = this.settings[`view_pict${i}`];
          picItem.value = i.toString();
          this.picList.push(picItem);
        }
      }
      this.cdRef.detectChanges();
    });

    // get the Twit Url array from the right panel
    this.subscribers.twitUrls = this.mainService.addedUrls.subscribe((value) =>{
      this.addTwitUrls(value);
    });

    // raise the event of deleting all Twit
    this.subscribers.deleteAll = this.mainService.deleteAll.subscribe( value => {
      this.deleteAll();
    })

    // print html from Twit list
    this.subscribers.printHtml = this.mainService.printHtmlCommand.subscribe(value => {
      this.printHtml(value);
    });

    this.setHotKeys();
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.settings.unsubscribe();
    this.subscribers.twitUrls.unsubscribe();
    this.subscribers.deleteAll.unsubscribe();
    this.subscribers.printHtml.unsubscribe();
  }

  /**
   * ショートカットキー値を設定します。
   */
  setHotKeys(){
    // レス描写エリアの一番上に移動
    this.hotkeysService.add(new Hotkey(['ins', 'home'],
      (event: KeyboardEvent): boolean => {
        this.listContainer.scrollToIndex(0);
        return false; // Prevent bubbling
      }));

    // レス描写エリアの一番下に移動
    this.hotkeysService.add(new Hotkey(['end', 'del'], (event: KeyboardEvent): boolean => {
      this.listContainer.scrollToIndex(this.twitList.length-1);
      return false; // Prevent bubbling
    }));
  }
  /**
   * add Twit items from the string array of Twit Url to Twit list
   * @param pTwitUrls: Twit Url array
   */
  async addTwitUrls(pTwitUrls: string[]) {
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f|\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|\ufe0f|\ufe0e)/g;
    //const emojiRegex = /((?:\ud83c\udde8\ud83c\uddf3|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddef\ud83c\uddf5|\ud83c\uddee\ud83c\uddf9|\ud83c\uddec\ud83c\udde7|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddea\ud83c\uddf8|\ud83c\udde9\ud83c\uddea|\u0039\u20e3|\u0038\u20e3|\u0037\u20e3|\u0036\u20e3|\u0035\u20e3|\u0034\u20e3|\u0033\u20e3|\u0032\u20e3|\u0031\u20e3|\u0030\u20e3|\u0023\u20e3|\ud83d\udeb3|\ud83d\udeb1|\ud83d\udeb0|\ud83d\udeaf|\ud83d\udeae|\ud83d\udea6|\ud83d\udea3|\ud83d\udea1|\ud83d\udea0|\ud83d\ude9f|\ud83d\ude9e|\ud83d\ude9d|\ud83d\ude9c|\ud83d\ude9b|\ud83d\ude98|\ud83d\ude96|\ud83d\ude94|\ud83d\ude90|\ud83d\ude8e|\ud83d\ude8d|\ud83d\ude8b|\ud83d\ude8a|\ud83d\ude88|\ud83d\ude86|\ud83d\ude82|\ud83d\ude81|\ud83d\ude36|\ud83d\ude34|\ud83d\ude2f|\ud83d\ude2e|\ud83d\ude2c|\ud83d\ude27|\ud83d\ude26|\ud83d\ude1f|\ud83d\ude1b|\ud83d\ude19|\ud83d\ude17|\ud83d\ude15|\ud83d\ude11|\ud83d\ude10|\ud83d\ude0e|\ud83d\ude08|\ud83d\ude07|\ud83d\ude00|\ud83d\udd67|\ud83d\udd66|\ud83d\udd65|\ud83d\udd64|\ud83d\udd63|\ud83d\udd62|\ud83d\udd61|\ud83d\udd60|\ud83d\udd5f|\ud83d\udd5e|\ud83d\udd5d|\ud83d\udd5c|\ud83d\udd2d|\ud83d\udd2c|\ud83d\udd15|\ud83d\udd09|\ud83d\udd08|\ud83d\udd07|\ud83d\udd06|\ud83d\udd05|\ud83d\udd04|\ud83d\udd02|\ud83d\udd01|\ud83d\udd00|\ud83d\udcf5|\ud83d\udcef|\ud83d\udced|\ud83d\udcec|\ud83d\udcb7|\ud83d\udcb6|\ud83d\udcad|\ud83d\udc6d|\ud83d\udc6c|\ud83d\udc65|\ud83d\udc2a|\ud83d\udc16|\ud83d\udc15|\ud83d\udc13|\ud83d\udc10|\ud83d\udc0f|\ud83d\udc0b|\ud83d\udc0a|\ud83d\udc09|\ud83d\udc08|\ud83d\udc07|\ud83d\udc06|\ud83d\udc05|\ud83d\udc04|\ud83d\udc03|\ud83d\udc02|\ud83d\udc01|\ud83d\udc00|\ud83c\udfe4|\ud83c\udfc9|\ud83c\udfc7|\ud83c\udf7c|\ud83c\udf50|\ud83c\udf4b|\ud83c\udf33|\ud83c\udf32|\ud83c\udf1e|\ud83c\udf1d|\ud83c\udf1c|\ud83c\udf1a|\ud83c\udf18|\ud83c\udccf|\ud83c\udd70|\ud83c\udd71|\ud83c\udd7e|\ud83c\udd8e|\ud83c\udd91|\ud83c\udd92|\ud83c\udd93|\ud83c\udd94|\ud83c\udd95|\ud83c\udd96|\ud83c\udd97|\ud83c\udd98|\ud83c\udd99|\ud83c\udd9a|\ud83d\ude0d|\ud83d\udec5|\ud83d\udec4|\ud83d\udec3|\ud83d\udec2|\ud83d\udec1|\ud83d\udebf|\ud83d\udeb8|\ud83d\udeb7|\ud83d\udeb5|\ud83c\ude01|\ud83c\ude02|\ud83c\ude32|\ud83c\ude33|\ud83c\ude34|\ud83c\ude35|\ud83c\ude36|\ud83c\ude37|\ud83c\ude38|\ud83c\ude39|\ud83c\ude3a|\ud83c\ude50|\ud83c\ude51|\ud83c\udf00|\ud83c\udf01|\ud83c\udf02|\ud83c\udf03|\ud83c\udf04|\ud83c\udf05|\ud83c\udf06|\ud83c\udf07|\ud83c\udf08|\ud83c\udf09|\ud83c\udf0a|\ud83c\udf0b|\ud83c\udf0c|\ud83c\udf0f|\ud83c\udf11|\ud83c\udf13|\ud83c\udf14|\ud83c\udf15|\ud83c\udf19|\ud83c\udf1b|\ud83c\udf1f|\ud83c\udf20|\ud83c\udf30|\ud83c\udf31|\ud83c\udf34|\ud83c\udf35|\ud83c\udf37|\ud83c\udf38|\ud83c\udf39|\ud83c\udf3a|\ud83c\udf3b|\ud83c\udf3c|\ud83c\udf3d|\ud83c\udf3e|\ud83c\udf3f|\ud83c\udf40|\ud83c\udf41|\ud83c\udf42|\ud83c\udf43|\ud83c\udf44|\ud83c\udf45|\ud83c\udf46|\ud83c\udf47|\ud83c\udf48|\ud83c\udf49|\ud83c\udf4a|\ud83c\udf4c|\ud83c\udf4d|\ud83c\udf4e|\ud83c\udf4f|\ud83c\udf51|\ud83c\udf52|\ud83c\udf53|\ud83c\udf54|\ud83c\udf55|\ud83c\udf56|\ud83c\udf57|\ud83c\udf58|\ud83c\udf59|\ud83c\udf5a|\ud83c\udf5b|\ud83c\udf5c|\ud83c\udf5d|\ud83c\udf5e|\ud83c\udf5f|\ud83c\udf60|\ud83c\udf61|\ud83c\udf62|\ud83c\udf63|\ud83c\udf64|\ud83c\udf65|\ud83c\udf66|\ud83c\udf67|\ud83c\udf68|\ud83c\udf69|\ud83c\udf6a|\ud83c\udf6b|\ud83c\udf6c|\ud83c\udf6d|\ud83c\udf6e|\ud83c\udf6f|\ud83c\udf70|\ud83c\udf71|\ud83c\udf72|\ud83c\udf73|\ud83c\udf74|\ud83c\udf75|\ud83c\udf76|\ud83c\udf77|\ud83c\udf78|\ud83c\udf79|\ud83c\udf7a|\ud83c\udf7b|\ud83c\udf80|\ud83c\udf81|\ud83c\udf82|\ud83c\udf83|\ud83c\udf84|\ud83c\udf85|\ud83c\udf86|\ud83c\udf87|\ud83c\udf88|\ud83c\udf89|\ud83c\udf8a|\ud83c\udf8b|\ud83c\udf8c|\ud83c\udf8d|\ud83c\udf8e|\ud83c\udf8f|\ud83c\udf90|\ud83c\udf91|\ud83c\udf92|\ud83c\udf93|\ud83c\udfa0|\ud83c\udfa1|\ud83c\udfa2|\ud83c\udfa3|\ud83c\udfa4|\ud83c\udfa5|\ud83c\udfa6|\ud83c\udfa7|\ud83c\udfa8|\ud83c\udfa9|\ud83c\udfaa|\ud83c\udfab|\ud83c\udfac|\ud83c\udfad|\ud83c\udfae|\ud83c\udfaf|\ud83c\udfb0|\ud83c\udfb1|\ud83c\udfb2|\ud83c\udfb3|\ud83c\udfb4|\ud83c\udfb5|\ud83c\udfb6|\ud83c\udfb7|\ud83c\udfb8|\ud83c\udfb9|\ud83c\udfba|\ud83c\udfbb|\ud83c\udfbc|\ud83c\udfbd|\ud83c\udfbe|\ud83c\udfbf|\ud83c\udfc0|\ud83c\udfc1|\ud83c\udfc2|\ud83c\udfc3|\ud83c\udfc4|\ud83c\udfc6|\ud83c\udfc8|\ud83c\udfca|\ud83c\udfe0|\ud83c\udfe1|\ud83c\udfe2|\ud83c\udfe3|\ud83c\udfe5|\ud83c\udfe6|\ud83c\udfe7|\ud83c\udfe8|\ud83c\udfe9|\ud83c\udfea|\ud83c\udfeb|\ud83c\udfec|\ud83c\udfed|\ud83c\udfee|\ud83c\udfef|\ud83c\udff0|\ud83d\udc0c|\ud83d\udc0d|\ud83d\udc0e|\ud83d\udc11|\ud83d\udc12|\ud83d\udc14|\ud83d\udc17|\ud83d\udc18|\ud83d\udc19|\ud83d\udc1a|\ud83d\udc1b|\ud83d\udc1c|\ud83d\udc1d|\ud83d\udc1e|\ud83d\udc1f|\ud83d\udc20|\ud83d\udc21|\ud83d\udc22|\ud83d\udc23|\ud83d\udc24|\ud83d\udc25|\ud83d\udc26|\ud83d\udc27|\ud83d\udc28|\ud83d\udc29|\ud83d\udc2b|\ud83d\udc2c|\ud83d\udc2d|\ud83d\udc2e|\ud83d\udc2f|\ud83d\udc30|\ud83d\udc31|\ud83d\udc32|\ud83d\udc33|\ud83d\udc34|\ud83d\udc35|\ud83d\udc36|\ud83d\udc37|\ud83d\udc38|\ud83d\udc39|\ud83d\udc3a|\ud83d\udc3b|\ud83d\udc3c|\ud83d\udc3d|\ud83d\udc3e|\ud83d\udc40|\ud83d\udc42|\ud83d\udc43|\ud83d\udc44|\ud83d\udc45|\ud83d\udc46|\ud83d\udc47|\ud83d\udc48|\ud83d\udc49|\ud83d\udc4a|\ud83d\udc4b|\ud83d\udc4c|\ud83d\udc4d|\ud83d\udc4e|\ud83d\udc4f|\ud83d\udc50|\ud83d\udc51|\ud83d\udc52|\ud83d\udc53|\ud83d\udc54|\ud83d\udc55|\ud83d\udc56|\ud83d\udc57|\ud83d\udc58|\ud83d\udc59|\ud83d\udc5a|\ud83d\udc5b|\ud83d\udc5c|\ud83d\udc5d|\ud83d\udc5e|\ud83d\udc5f|\ud83d\udc60|\ud83d\udc61|\ud83d\udc62|\ud83d\udc63|\ud83d\udc64|\ud83d\udc66|\ud83d\udc67|\ud83d\udc68|\ud83d\udc69|\ud83d\udc6a|\ud83d\udc6b|\ud83d\udc6e|\ud83d\udc6f|\ud83d\udc70|\ud83d\udc71|\ud83d\udc72|\ud83d\udc73|\ud83d\udc74|\ud83d\udc75|\ud83d\udc76|\ud83d\udc77|\ud83d\udc78|\ud83d\udc79|\ud83d\udc7a|\ud83d\udc7b|\ud83d\udc7c|\ud83d\udc7d|\ud83d\udc7e|\ud83d\udc7f|\ud83d\udc80|\ud83d\udc81|\ud83d\udc82|\ud83d\udc83|\ud83d\udc84|\ud83d\udc85|\ud83d\udc86|\ud83d\udc87|\ud83d\udc88|\ud83d\udc89|\ud83d\udc8a|\ud83d\udc8b|\ud83d\udc8c|\ud83d\udc8d|\ud83d\udc8e|\ud83d\udc8f|\ud83d\udc90|\ud83d\udc91|\ud83d\udc92|\ud83d\udc93|\ud83d\udc94|\ud83d\udc95|\ud83d\udc96|\ud83d\udc97|\ud83d\udc98|\ud83d\udc99|\ud83d\udc9a|\ud83d\udc9b|\ud83d\udc9c|\ud83d\udc9d|\ud83d\udc9e|\ud83d\udc9f|\ud83d\udca0|\ud83d\udca1|\ud83d\udca2|\ud83d\udca3|\ud83d\udca4|\ud83d\udca5|\ud83d\udca6|\ud83d\udca7|\ud83d\udca8|\ud83d\udca9|\ud83d\udcaa|\ud83d\udcab|\ud83d\udcac|\ud83d\udcae|\ud83d\udcaf|\ud83d\udcb0|\ud83d\udcb1|\ud83d\udcb2|\ud83d\udcb3|\ud83d\udcb4|\ud83d\udcb5|\ud83d\udcb8|\ud83d\udcb9|\ud83d\udcba|\ud83d\udcbb|\ud83d\udcbc|\ud83d\udcbd|\ud83d\udcbe|\ud83d\udcbf|\ud83d\udcc0|\ud83d\udcc1|\ud83d\udcc2|\ud83d\udcc3|\ud83d\udcc4|\ud83d\udcc5|\ud83d\udcc6|\ud83d\udcc7|\ud83d\udcc8|\ud83d\udcc9|\ud83d\udcca|\ud83d\udccb|\ud83d\udccc|\ud83d\udccd|\ud83d\udcce|\ud83d\udccf|\ud83d\udcd0|\ud83d\udcd1|\ud83d\udcd2|\ud83d\udcd3|\ud83d\udcd4|\ud83d\udcd5|\ud83d\udcd6|\ud83d\udcd7|\ud83d\udcd8|\ud83d\udcd9|\ud83d\udcda|\ud83d\udcdb|\ud83d\udcdc|\ud83d\udcdd|\ud83d\udcde|\ud83d\udcdf|\ud83d\udce0|\ud83d\udce1|\ud83d\udce2|\ud83d\udce3|\ud83d\udce4|\ud83d\udce5|\ud83d\udce6|\ud83d\udce7|\ud83d\udce8|\ud83d\udce9|\ud83d\udcea|\ud83d\udceb|\ud83d\udcee|\ud83d\udcf0|\ud83d\udcf1|\ud83d\udcf2|\ud83d\udcf3|\ud83d\udcf4|\ud83d\udcf6|\ud83d\udcf7|\ud83d\udcf9|\ud83d\udcfa|\ud83d\udcfb|\ud83d\udcfc|\ud83d\udd03|\ud83d\udd0a|\ud83d\udd0b|\ud83d\udd0c|\ud83d\udd0d|\ud83d\udd0e|\ud83d\udd0f|\ud83d\udd10|\ud83d\udd11|\ud83d\udd12|\ud83d\udd13|\ud83d\udd14|\ud83d\udd16|\ud83d\udd17|\ud83d\udd18|\ud83d\udd19|\ud83d\udd1a|\ud83d\udd1b|\ud83d\udd1c|\ud83d\udd1d|\ud83d\udd1e|\ud83d\udd1f|\ud83d\udd20|\ud83d\udd21|\ud83d\udd22|\ud83d\udd23|\ud83d\udd24|\ud83d\udd25|\ud83d\udd26|\ud83d\udd27|\ud83d\udd28|\ud83d\udd29|\ud83d\udd2a|\ud83d\udd2b|\ud83d\udd2e|\ud83d\udd2f|\ud83d\udd30|\ud83d\udd31|\ud83d\udd32|\ud83d\udd33|\ud83d\udd34|\ud83d\udd35|\ud83d\udd36|\ud83d\udd37|\ud83d\udd38|\ud83d\udd39|\ud83d\udd3a|\ud83d\udd3b|\ud83d\udd3c|\ud83d\udd3d|\ud83d\udd50|\ud83d\udd51|\ud83d\udd52|\ud83d\udd53|\ud83d\udd54|\ud83d\udd55|\ud83d\udd56|\ud83d\udd57|\ud83d\udd58|\ud83d\udd59|\ud83d\udd5a|\ud83d\udd5b|\ud83d\uddfb|\ud83d\uddfc|\ud83d\uddfd|\ud83d\uddfe|\ud83d\uddff|\ud83d\ude01|\ud83d\ude02|\ud83d\ude03|\ud83d\ude04|\ud83d\ude05|\ud83d\ude06|\ud83d\ude09|\ud83d\ude0a|\ud83d\ude0b|\ud83d\ude0c|\ud83d\udeb4|\ud83d\ude0f|\ud83d\ude12|\ud83d\ude13|\ud83d\ude14|\ud83d\ude16|\ud83d\ude18|\ud83d\ude1a|\ud83d\ude1c|\ud83d\ude1d|\ud83d\ude1e|\ud83d\ude20|\ud83d\ude21|\ud83d\ude22|\ud83d\ude23|\ud83d\ude24|\ud83d\ude25|\ud83d\ude28|\ud83d\ude29|\ud83d\ude2a|\ud83d\ude2b|\ud83d\ude2d|\ud83d\ude30|\ud83d\ude31|\ud83d\ude32|\ud83d\ude33|\ud83d\ude35|\ud83d\ude37|\ud83d\ude38|\ud83d\ude39|\ud83d\ude3a|\ud83d\ude3b|\ud83d\ude3c|\ud83d\ude3d|\ud83d\ude3e|\ud83d\ude3f|\ud83d\ude40|\ud83d\ude45|\ud83d\ude46|\ud83d\ude47|\ud83d\ude48|\ud83d\ude49|\ud83d\ude4a|\ud83d\ude4b|\ud83d\ude4c|\ud83d\ude4d|\ud83d\ude4e|\ud83d\ude4f|\ud83d\ude80|\ud83d\ude83|\ud83d\ude84|\ud83d\ude85|\ud83d\ude87|\ud83d\ude89|\ud83d\ude8c|\ud83d\ude8f|\ud83d\ude91|\ud83d\ude92|\ud83d\ude93|\ud83d\ude95|\ud83d\ude97|\ud83d\ude99|\ud83d\ude9a|\ud83d\udea2|\ud83d\udea4|\ud83d\udea5|\ud83d\udea7|\ud83d\udea8|\ud83d\udea9|\ud83d\udeaa|\ud83d\udeab|\ud83d\udeac|\ud83d\udead|\ud83d\udeb2|\ud83d\udeb6|\ud83d\udeb9|\ud83d\udeba|\ud83d\udebb|\ud83d\udebc|\ud83d\udebd|\ud83d\udebe|\ud83d\udec0|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ud83c\udf18|\ud83c\udf1a|\ud83c\udf1c|\ud83c\udf1d|\ud83c\udf1e|\ud83c\udf32|\ud83c\udf33|\ud83c\udf4b|\ud83c\udf50|\ud83c\udf7c|\ud83c\udfc7|\ud83c\udfc9|\ud83c\udfe4|\ud83d\udc00|\ud83d\udc01|\ud83d\udc02|\ud83d\udc03|\ud83d\udc04|\ud83d\udc05|\ud83d\udc06|\ud83d\udc07|\ud83d\udc08|\ud83d\udc09|\ud83d\udc0a|\ud83d\udc0b|\ud83d\udc0f|\ud83d\udc10|\ud83d\udc13|\ud83d\udc15|\ud83d\udc16|\ud83d\udc2a|\ud83d\udc65|\ud83d\udc6c|\ud83d\udc6d|\ud83d\udcad|\ud83d\udcb6|\ud83d\udcb7|\ud83d\udcec|\ud83d\udced|\ud83d\udcef|\ud83d\udcf5|\ud83d\udd00|\ud83d\udd01|\ud83d\udd02|\ud83d\udd04|\ud83d\udd05|\ud83d\udd06|\ud83d\udd07|\ud83d\udd08|\ud83d\udd09|\ud83d\udd15|\ud83d\udd2c|\ud83d\udd2d|\ud83d\udd5c|\ud83d\udd5d|\ud83d\udd5e|\ud83d\udd5f|\ud83d\udd60|\ud83d\udd61|\ud83d\udd62|\ud83d\udd63|\ud83d\udd64|\ud83d\udd65|\ud83d\udd66|\ud83d\udd67|\ud83d\ude00|\ud83d\ude07|\ud83d\ude08|\ud83d\ude0e|\ud83d\ude10|\ud83d\ude11|\ud83d\ude15|\ud83d\ude17|\ud83d\ude19|\ud83d\ude1b|\ud83d\ude1f|\ud83d\ude26|\ud83d\ude27|\ud83d\ude2c|\ud83d\ude2e|\ud83d\ude2f|\ud83d\ude34|\ud83d\ude36|\ud83d\ude81|\ud83d\ude82|\ud83d\ude86|\ud83d\ude88|\ud83d\ude8a|\ud83d\ude8b|\ud83d\ude8d|\ud83d\ude8e|\ud83d\ude90|\ud83d\ude94|\ud83d\ude96|\ud83d\ude98|\ud83d\ude9b|\ud83d\ude9c|\ud83d\ude9d|\ud83d\ude9e|\ud83d\ude9f|\ud83d\udea0|\ud83d\udea1|\ud83d\udea3|\ud83d\udea6|\ud83d\udeae|\ud83d\udeaf|\ud83d\udeb0|\ud83d\udeb1|\ud83d\udeb3|\ud83d\udeb4|\ud83d\udeb5|\ud83d\udeb7|\ud83d\udeb8|\ud83d\udebf|\ud83d\udec1|\ud83d\udec2|\ud83d\udec3|\ud83d\udec4|\ud83d\udec5|\ud83c\udf17|\ud83c\udf16|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ud83c\udf10|\ud83c\udf12|\ud83c\udf16|\ud83c\udf17|\ud83c\udf18|\ud83c\udf1a|\ud83c\udf1c|\ud83c\udf1d|\ud83c\udf1e|\ud83c\udf32|\ud83c\udf33|\ud83c\udf4b|\ud83c\udf50|\ud83c\udf7c|\ud83c\udfc7|\ud83c\udfc9|\ud83c\udfe4|\ud83d\udc00|\ud83d\udc01|\ud83d\udc02|\ud83d\udc03|\ud83d\udc04|\ud83d\udc05|\ud83d\udc06|\ud83d\udc07|\ud83d\udc08|\ud83d\udc09|\ud83d\udc0a|\ud83d\udc0b|\ud83d\udc0f|\ud83d\udc10|\ud83d\udc13|\ud83d\udc15|\ud83d\udc16|\ud83d\udc2a|\ud83d\udc65|\ud83d\udc6c|\ud83d\udc6d|\ud83d\udcad|\ud83d\udcb6|\ud83d\udcb7|\ud83d\udcec|\ud83d\udced|\ud83d\udcef|\ud83d\udcf5|\ud83d\udd00|\ud83d\udd01|\ud83d\udd02|\ud83d\udd04|\ud83d\udd05|\ud83d\udd06|\ud83d\udd07|\ud83d\udd08|\ud83d\udd09|\ud83d\udd15|\ud83d\udd2c|\ud83d\udd2d|\ud83d\udd5c|\ud83d\udd5d|\ud83d\udd5e|\ud83d\udd5f|\ud83d\udd60|\ud83d\udd61|\ud83d\udd62|\ud83d\udd63|\ud83d\udd64|\ud83d\udd65|\ud83d\udd66|\ud83d\udd67|\ud83d\ude00|\ud83d\ude07|\ud83d\ude08|\ud83d\ude0e|\ud83d\ude10|\ud83d\ude11|\ud83d\ude15|\ud83d\ude17|\ud83d\ude19|\ud83d\ude1b|\ud83d\ude1f|\ud83d\ude26|\ud83d\ude27|\ud83d\ude2c|\ud83d\ude2e|\ud83d\ude2f|\ud83d\ude34|\ud83d\ude36|\ud83d\ude81|\ud83d\ude82|\ud83d\ude86|\ud83d\ude88|\ud83d\ude8a|\ud83d\ude8b|\ud83d\ude8d|\ud83d\ude8e|\ud83d\ude90|\ud83d\ude94|\ud83d\ude96|\ud83d\ude98|\ud83d\ude9b|\ud83d\ude9c|\ud83d\ude9d|\ud83d\ude9e|\ud83d\ude9f|\ud83d\udea0|\ud83d\udea1|\ud83d\udea3|\ud83d\udea6|\ud83d\udeae|\ud83d\udeaf|\ud83d\udeb0|\ud83d\udeb1|\ud83d\udeb3|\ud83d\udeb4|\ud83d\udeb5|\ud83d\udeb7|\ud83d\udeb8|\ud83d\udebf|\ud83d\udec1|\ud83d\udec2|\ud83d\udec3|\ud83d\udec4|\ud83d\udec5|\ud83c\udf12|\ud83c\udf10|\ud83c\udde6|\ud83c\udde7|\ud83c\udde8|\ud83c\udde9|\ud83c\uddea|\ud83c\uddeb|\ud83c\uddec|\ud83c\udded|\ud83c\uddee|\ud83c\uddef|\ud83c\uddf0|\ud83c\uddf1|\ud83c\uddf2|\ud83c\uddf3|\ud83c\uddf4|\ud83c\uddf5|\ud83c\uddf6|\ud83c\uddf7|\ud83c\uddf8|\ud83c\uddf9|\ud83c\uddfa|\ud83c\uddfb|\ud83c\uddfc|\ud83c\uddfd|\ud83c\uddfe|\ud83c\uddff|\ud83c\udf0d|\ud83c\udf0e|\ue50a|\ue50a|\ue50a|\u27bf|\u3030|\u27b0|\u2797|\u2796|\u2795|\u2755|\u2754|\u2753|\u274e|\u274c|\u2728|\u270b|\u270a|\u2705|\u26ce|\u27bf|\u23f3|\u23f0|\u23ec|\u23eb|\u23ea|\u23e9|\u2122|\u27bf|\u00a9|\u00ae)|(?:(?:\ud83c\udc04|\ud83c\udd7f|\ud83c\ude1a|\ud83c\ude2f|\u3299|\u3297|\u303d|\u2b55|\u2b50|\u2b1c|\u2b1b|\u2b07|\u2b06|\u2b05|\u2935|\u2934|\u27a1|\u2764|\u2757|\u2747|\u2744|\u2734|\u2733|\u2716|\u2714|\u2712|\u270f|\u270c|\u2709|\u2708|\u2702|\u26fd|\u26fa|\u26f5|\u26f3|\u26f2|\u26ea|\u26d4|\u26c5|\u26c4|\u26be|\u26bd|\u26ab|\u26aa|\u26a1|\u26a0|\u2693|\u267b|\u2668|\u2666|\u2665|\u2663|\u2660|\u2653|\u2652|\u2651|\u2650|\u264f|\u264e|\u264d|\u264c|\u264b|\u264a|\u2649|\u2648|\u263a|\u261d|\u2615|\u2614|\u2611|\u260e|\u2601|\u2600|\u25fe|\u25fd|\u25fc|\u25fb|\u25c0|\u25b6|\u25ab|\u25aa|\u24c2|\u231b|\u231a|\u21aa|\u21a9|\u2199|\u2198|\u2197|\u2196|\u2195|\u2194|\u2139|\u2049|\u203c|\u267f)([\uFE0E\uFE0F]?)))/g, 

    for (const twitter of pTwitUrls) {
      let isExists = false;
      for (const item of this.twitList){
        if(item.url === twitter){
          isExists = true;
        }
      }
      if (isExists){
        continue;
      }

      const newItem = new TwitItem();
      newItem.container = '0';
      newItem.picture = '0';
      newItem.isReplaceUrl = false;
      newItem.photos = [];
      const embedResponse = await fetch(`https://publish.twitter.com/oembed?hide_thread=true&align=center&omit_script=true&url=${twitter}`);
      if (embedResponse.ok) {
        const data = await embedResponse.json();
        newItem.content = data.html;
        newItem.url = twitter;
        const id = twitter.replace(/(https?:\/\/(mobile\.)*twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/gi, `$4`);
        newItem.id = id;
        let apiUrl = `https://api.twitter.com/2/tweets/${id}?`;
        apiUrl += `tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities` +
          `&expansions=author_id,referenced_tweets.id,referenced_tweets.id.author_id,entities.mentions.username,attachments.poll_ids,attachments.media_keys,in_reply_to_user_id,geo.place_id` +
          `&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width` +
          `&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type` +
          `&user.fields=id,location,name,pinned_tweet_id,profile_image_url,url,username`;
        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAADM%2BGwEAAAAA1zXPkODFT0l6gK3VrRtnDgqUk20%3DFf2YdxsJ6l1LQsSdsL0IzXKRJLi5DYynLKudEZ0tk8E62h2h5F',
            'Content-Type': 'application/json'
          }
        });
        if (apiResponse.ok){
          const apiData = await apiResponse.json();
          newItem.createdAt = apiData.data.created_at;
          newItem.text = '';

          let fromIndex = 0;
          if(apiData.data.entities !== undefined && apiData.data.entities.hashtags !== undefined){
            for (const hashtag of apiData.data.entities.hashtags){
              let toIndex = apiData.data.text.indexOf(hashtag.tag, hashtag.start) - 1;
              newItem.text += apiData.data.text.substring(fromIndex, toIndex);
              newItem.text += `<a class="t_link_hashtag" href="https://twitter.com/hashtag/${hashtag.tag}" target="_blank">#${hashtag.tag}</a>`;
              fromIndex = toIndex + hashtag.tag.length + 1;
            }
            newItem.text += apiData.data.text.substr(fromIndex);
          }else{
            newItem.text = apiData.data.text;
          }
          newItem.text = newItem.text.replace(/\n/gi,'<br>\n');
          console.log(newItem.text);
          newItem.text = newItem.text.replace(emojiRegex, this.getEmojiCode);
          console.log(newItem.text);
          newItem.text = newItem.text.replace(' &#65038;', "");
          newItem.text = newItem.text.replace(' &#65039;', "");
          // newItem.text = emoji.replace(newItem.text, this.getEmojiCode);

          let youtubeUrlText = '';
          if (apiData.data.entities !== undefined && apiData.data.entities.urls !== undefined){
            let replacedUrls = [];
            for (const urlItem of apiData.data.entities.urls){
              if (replacedUrls.indexOf(urlItem.url) !== -1){
                continue;
              }
              const re = new RegExp(urlItem.url.replace(/\//gi, '\\/'), 'gi');
              let replacedUrl;
              if (new RegExp(/^pic\.twitter\.com/g).test(urlItem.display_url)){
                replacedUrl= `<a class="t_link_pic" href="${urlItem.url}" target="_blank">${urlItem.display_url}</a>`;
              } else if(new RegExp(/^twitter\.com/g).test(urlItem.display_url)){
                replacedUrl= `<a class="t_link_tweet" href="${urlItem.url}" target="_blank">${urlItem.display_url}</a>`;
              } else if(new RegExp(/youtu[.]*be\//).test(urlItem.display_url)){
                replacedUrl= `<a class="t_link_youtube" href="${urlItem.url}" target="_blank">${urlItem.display_url}</a>`;
              } else{
                replacedUrl= `<a class="t_link" href="${urlItem.url}" target="_blank">${urlItem.display_url}</a>`;
              }

              if (this.settings.youtube && new RegExp(/youtu[.]*be\//).test(urlItem.display_url)){
                const youtubeId = urlItem.display_url.replace(/youtu[.]*be\//gi,'');
                const response = await fetch(`http://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}`);
                if (response.ok) {
                  const data = await response.json();
                  youtubeUrlText += `${data.html}\n`;
                }else{
                  if (response.status === 401){
                    youtubeUrlText += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
                  }
                }
              }
              newItem.text = newItem.text.replace(re,replacedUrl);
              replacedUrls.push(urlItem.url);
            }
          }
          if(youtubeUrlText.length > 0){
            youtubeUrlText = `\n<div class="t_youtube">\n${youtubeUrlText}</div><!-- e-t_youtube -->`;
          }
          newItem.text = `${newItem.text}${youtubeUrlText}`;

          newItem.username = apiData.includes.users[0].username;
          newItem.profileImageUrl = apiData.includes.users[0].profile_image_url;
          newItem.name = apiData.includes.users[0].name;
          console.log(newItem.name);
          newItem.name = newItem.name.replace(emojiRegex, this.getEmojiCode);
          console.log(newItem.name);
          newItem.name = newItem.name.replace(' &#65038;', "");
          newItem.name = newItem.name.replace(' &#65039;', "");

          // newItem.name = emoji.replace(newItem.name, this.getEmojiCode);
          for (const user of apiData.includes.users){
            const re = new RegExp(`@${user.username}`,'gi');
            newItem.text = newItem.text.replace(re, `<a class="t_link_username" href="https://twitter.com/${user.username}" data-screen-name="${user.username}">@${user.username}</a>`);
          }
          newItem.photos = [];
          newItem.videos = [];
          if(apiData.includes.media !== undefined) {
            for (const media of apiData.includes.media) {
              if (media.type === 'photo') {
                newItem.photos.push({
                  url: media.url
                });
              } else if (media.type === 'video' || media.type === 'animated_gif' ){
                newItem.previewImageUrl = media.preview_image_url;
                const response = await fetch(`https://api.twitter.com/1.1/statuses/lookup.json?id=${id}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAADM%2BGwEAAAAA1zXPkODFT0l6gK3VrRtnDgqUk20%3DFf2YdxsJ6l1LQsSdsL0IzXKRJLi5DYynLKudEZ0tk8E62h2h5F',
                    'Content-Type': 'application/json'
                  }
                });
                if (response.ok){
                  const videoData = await response.json();
                  if (videoData.length){
                    if (videoData[0].extended_entities !== undefined && videoData[0].extended_entities.media[0].video_info.variants !== undefined){
                      for (const videoItem of videoData[0].extended_entities.media[0].video_info.variants){
                       newItem.videos.push({
                         url: videoItem.url,
                         contentType: videoItem.content_type
                       });
                      }
                    }else{
                      const response = await fetch(`https://cdn.syndication.twimg.com/tweet?id=${id}&lang=jp`);
                      if (response.ok){
                        const cdnVideoData = await response.json();
                        if(cdnVideoData !== undefined){
                          if(cdnVideoData.video !== undefined && cdnVideoData.video.variants !== undefined ){
                            for (const videoItem of cdnVideoData.video.variants){
                              newItem.videos.push({
                                url: videoItem.src,
                                contentType: videoItem.type
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          this.twitList.push(newItem);
        }
      }
    }
    this.setTotalCountStatus();
    this.cdRef.detectChanges();

  }

  setTotalCountStatus(){
    this.mainService.setTotalCount({
      totalCount: this.twitList.length
    })
  }
  /**
   * delete all items from Twit list
   */
  deleteAll(){
    this.twitList.length = 0;
    this.setTotalCountStatus();
    this.cdRef.detectChanges();
  }

  deleteOne(twitItem: TwitItem) {
    const index = this.twitList.indexOf(twitItem);
    this.twitList.splice(index,1);
    this.setTotalCountStatus();
    this.cdRef.detectChanges();
  }

  vsTwitDragStartedHandler($event: CdkDragStart, twitItem: any) {
    this.selectedTwitIndex = this.twitList.indexOf(twitItem);
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

    moveItemInArray(this.twitList, this.selectedTwitIndex,
      this.selectedTwitIndex + ($event.currentIndex - $event.previousIndex));
  }

  /**
   * ツイートを一番上に移動
   * @param item: 移動ツイート
   */
  moveToTop(item: any) {
    const index = this.twitList.indexOf(item);
    const startIndex = this.listContainer.viewPortInfo.startIndex + 1;
    moveItemInArray(this.twitList, index, 0);
    this.listContainer.scrollToIndex(startIndex);
  }

  /**
   * ツイートを一番下に移動
   * @param item: 移動ツイート
   */
  moveToBottom(item: any) {
    const index = this.twitList.indexOf(item);
    const startIndex = this.listContainer.viewPortInfo.startIndex;
    moveItemInArray(this.twitList, index, this.twitList.length - 1);
    this.listContainer.scrollToIndex(startIndex);
  }

  btnSortReverseClickHandler() {
    this.twitList.reverse();
    this.cdRef.detectChanges();
  }

  btnSortAscDateClickHandler() {
    this.twitList.sort((a, b) => {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    this.cdRef.detectChanges();
  }

  btnSortDescDateClickHandler() {
    this.twitList.sort((a, b) => {
      return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
    this.cdRef.detectChanges();
  }

  private printHtml(value: any) {
    let output = '';
    let replacedImageList = [];
    for (const twit of this.twitList){
      let line = '\n\n\n\n\n\n';
      let containerNum = 1;
      if (value.container > 0 ){
        line += `<div class="t_container${value.container}">`;
        containerNum = value.container;
      } else if (value.container === 0 && twit.container !== '0'){
        line += `<div class="t_container${twit.container}">`;
        containerNum = Number(twit.container);
      } else{
        line += `<div class="t_container1">`;
        containerNum = 1;
      }
      line += `<div class="t_header"><div class="t_user_icon">\n`;
      line += `<a href="https://twitter.com/${twit.username}" target="_blank"><img src="${twit.profileImageUrl}" class="no_image_profile"></a></div>\n`;
      line += `<div class="t_user_wrap">\n`;
      line += `<span class="t_user_name"><a href="https://twitter.com/${twit.username}" target="_blank">${twit.name}</a></span>\n`;
      line += `<span class="t_user_id"><a href="https://twitter.com/${twit.username}" target="_blank">@${twit.username}</a></span></div>\n`;
      const tw_bird = this.settings[`con${containerNum}_tw_bird`];
      line += `<span class="t_bird_icon"><a href="${twit.url}" target="_blank"><img src="${this.settings.url}${tw_bird}"></a></span></div><!-- e-t_header -->\n`
      line += `<div class="t_honbun">\n`;
      line += twit.text + '\n';
      line += `</div><!-- e-t_honbun -->\n`;
      let imageTitle = '';
      if(twit.photos.length === 1){
        imageTitle = this.settings.title;
      }else if(twit.photos.length > 1){
        imageTitle = this.settings.title_fukusuu;
      }

      if(twit.photos.length > 0) {
        if(this.settings.pict1mai_kyousei_tuujou && twit.photos.length === 1){
          line += `<div class="t_media1"><!-- s-img -->\n`;
        }else if (value.imageType > 0){
          line += `<div class="t_media${value.imageType}"><!-- s-img -->\n`;
        } else{
          if (Number(twit.picture) > 0){
            line += `<div class="t_media${twit.picture}"><!-- s-img -->\n`;
          }else{
            line += `<div class="t_media1"><!-- s-img -->\n`;
          }
        }

        for (const photo of twit.photos) {
          let photoUrl = photo.url;
          if (value.isReplaceUrl || (!value.isReplaceUrl && twit.isReplaceUrl)){
            photoUrl = photo.url.replace(/https:\/\/pbs.twimg.com\/media/gi,value.replaceText);
            replacedImageList.push(photo.url);
          }
          // if(value.imageType > 1 || (value.imageType === 0 && Number(twit.picture) > 1)){
            line += '<div>';
          // }
          line += `<a href="${photoUrl}" class="swipe" rel="${twit.id}" title="${imageTitle}" target="_blank"><img src="${photoUrl}" class="no_image"`;
          if ((this.settings.pict1mai_kyousei_tuujou && twit.photos.length === 1) || value.imageType === 1 || (twit.picture === '1' && value.imageType === 0)){
            line += ` width="${value.imageWidth}"`
          }
          line += `></a>`;
          // if(value.imageType > 1 || (value.imageType === 0 && Number(twit.picture) > 1)){
            line += '</div>';
          // }
          line += '\n';
        }
        line += `<!-- e-img --></div><!-- e-t_media -->\n`;
      }

      if(twit.videos.length > 0){
        line += `<div class="t_media_video">\n`;
        line += `<video width="${value.videoWidth}" class="twitter_video" controls="controls" poster="${twit.previewImageUrl}" class="mtpro-media-video">`;
        for (const videoItem of twit.videos){
          line += `<source src="${videoItem.url}" type="${videoItem.contentType}">`;
        }
        line += `<p>動画を再生するには、videoタグをサポートしたブラウザが必要です。</p></video>\n`;
        line += `</div><!-- e-t_media_video -->\n`;
      }

      line += `<div class="t_footer"><div class="t_buttons">\n`;
      const tw_icon1 = this.settings[`con${containerNum}_tw_icon1`];
      const tw_icon2 = this.settings[`con${containerNum}_tw_icon2`];
      const tw_icon3 = this.settings[`con${containerNum}_tw_icon3`];
      line += `<a class="t_reply_button" href="https://twitter.com/intent/tweet?in_reply_to=${twit.id}"><img src="${this.settings.url}${tw_icon1}"></a>\n`;
      line += `<a class="t_retweet_button" href="https://twitter.com/intent/retweet?tweet_id=${twit.id}"><img src="${this.settings.url}${tw_icon2}"></a>\n`;
      line += `<a class="t_fav_button" href="https://twitter.com/intent/favorite?tweet_id=${twit.id}"><img src="${this.settings.url}${tw_icon3}"></a>\n`;
      line += `</div><!-- e-t_buttons -->\n`;
      let createdDate = new Date(twit.createdAt);
      let formattedDate = `${createdDate.getFullYear()}-${("0" + (createdDate.getMonth() +　1)).slice(-2)}-${("0" + (createdDate.getDate())).slice(-2)} ${("0" + (createdDate.getHours())).slice(-2)}:${("0" + (createdDate.getMinutes())).slice(-2)}`;
      line += `<div class="t_date"><a href="${twit.url}" target="_blank">${formattedDate}</a></div>\n`;
      line += `</div><!-- e-t_footer --></div><!-- e-t_container -->\n\n\n\n\n\n`;
      output += line;
    }
    if(replacedImageList.length > 0){
      output += `<div class="img_shuturyoku">\n\n`;
    }
    for (const replacedItem of replacedImageList){
      output += `${replacedItem}\n`;
    }

    if(replacedImageList.length > 0){
      output += `\n</div>`;
    }
    output = output.replace(/〜/gi,'&sim;');
    // let encoded_data = Encoding.convert(output, {
    //   from: 'UNICODE',
    //   to: 'SJIS',
    //   type: 'string',
    // });
    // encoded_data = encoded_data.replace(/(&#\d+;)\?/gi, `$1`);
    // output = Encoding.convert(encoded_data, {
    //   from: 'SJIS',
    //   to: 'UNICODE',
    //   type: 'string',
    // });

    this.mainService.setPrintHtml({
      html: output
    });
  }

  getEmojiCode (emoji) {
    // console.log(emoji);
    // console.log(emojiUnicode.raw(emoji.emoji));
    // let result = emojiUnicode.raw(emoji.emoji);
    // if (result.length > 0){
    //   result = `&#${result.replace(/\s+/g,';&#')};`;
    // }
    // return result;
    let comp;
    if (emoji.length === 1) {
      comp = emoji.charCodeAt(0);
    } else {
      comp = (
        (emoji.charCodeAt(0) - 0xD800) * 0x400
        + (emoji.charCodeAt(1) - 0xDC00) + 0x10000
      );
    }
    if (comp < 0) {
      comp = emoji.charCodeAt(0);
    }
    if(Number.isNaN(comp)){
      return emoji;
    }else{
      return `&#${comp.toString()};`;
    }
  };
}
