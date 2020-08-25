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
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f|\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
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
        const id = twitter.replace(/(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/gi, `$3`);
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
          newItem.text = newItem.text.replace(emojiRegex, this.getEmojiCode);

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
          newItem.name = newItem.name.replace(emojiRegex, this.getEmojiCode);
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
                       })
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
      line += `</div><!-- e-t_honbun -->\n`;
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
      output += `<div class ="img_shuturyoku">\n\n`;
    }
    for (const replacedItem of replacedImageList){
      output += `${replacedItem}\n`;
    }

    if(replacedImageList.length > 0){
      output += `\n</div>`;
    }
    output = output.replace(/〜/gi,'&sim;');
    let encoded_data = Encoding.convert(output, {
      from: 'UNICODE',
      to: 'SJIS',
      type: 'string',
    });
    encoded_data = encoded_data.replace(/(&#\d+;)\?/gi, `$1&#65039;`);
    output = Encoding.convert(encoded_data, {
      from: 'SJIS',
      to: 'UNICODE',
      type: 'string',
    });

    this.mainService.setPrintHtml({
      html: output
    });
  }

  getEmojiCode (emoji) {
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
