import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  ViewChild
} from '@angular/core';
import {TwitItem} from "../../models/twit-item";
import {DomSanitizer} from "@angular/platform-browser";
import {SimpleItem} from "../../models/pair-item";
import {MainService} from '../../main.service';
import {VirtualScrollerComponent} from "ngx-virtual-scroller";
import {Hotkey, HotkeysService} from 'angular2-hotkeys';

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Component({
  selector: 'app-twit-detail',
  templateUrl: './twit-detail.component.html',
  styleUrls: ['./twit-detail.component.css']
})
export class TwitDetailComponent implements OnInit {
  public subscribers: any = {};

  @Input() item: TwitItem;
  @Input() twitIndex: number;
  @Input() conList: SimpleItem[];
  @Input() picList: SimpleItem[];
  @Input() selectedCon;
  @Input() selectedPict;
  @Input() urlCheckColor;
  @Input() showCheckColor;

  @Output() setDraggableEmitter = new EventEmitter();
  @Output() moveTopEmitter = new EventEmitter();
  @Output() moveBottomEmitter = new EventEmitter();
  @Output() deleteEmitter = new EventEmitter();
  @Output() containerClickEmitter = new EventEmitter();
  @Output() moveUpEmitter = new EventEmitter();
  @Output() moveDownEmitter = new EventEmitter();

  @ViewChild('tweetContent') tweetContent: ElementRef;
  @ViewChild('toFocus') widthInput: ElementRef;

  constructor(private mainService: MainService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    // @ts-ignore
    twttr.widgets.load();

    this.subscribers.focusImageWidth = this.mainService.focusImageWidth.subscribe(value => {
      this.imageWidthInputFocus(value)
    });

    if(this.selectedCon > 0){
      this.item.container = this.conList[this.selectedCon-1].value;
      this.item.containerColor = this.conList[this.selectedCon-1].color;
    }
    if(this.selectedPict > 0) {
      this.item.picture = this.picList[this.selectedPict - 1].value;
      this.item.pictureColor = this.picList[this.selectedPict - 1].color;
    }
  }

  /**
   * Unsubscribe the completed service subscribers
   */
  ngOnDestroy(){
    this.subscribers.focusImageWidth.unsubscribe();
  }

  btnMoveTopClickHandler() {
    this.moveTopEmitter.emit();
  }

  btnMoveBottomClickHandler() {
    this.moveBottomEmitter.emit();
  }

  btnMoveUpClickHandler() {
    this.moveUpEmitter.emit();
  }

  btnMoveDownClickHandler() {
    this.moveDownEmitter.emit();
  }

  btnDeleteClickHandler() {
    this.deleteEmitter.emit();
  }

  optContainerClickHandler(event, conItem: SimpleItem) {
    this.item.containerColor = conItem.color;
    this.item.backcolor = conItem.backcolor;
    this.containerClickEmitter.emit();
    event.target.blur();
  }

  optPictureClickHandler(event, picItem: SimpleItem) {
    this.item.pictureColor = picItem.color;
    event.target.blur();
  }

  imageWidthInputFocus(value: number) {
    if (value ===  this.twitIndex)
      this.widthInput.nativeElement.focus();
  }

  urlDisplayClickHandler(event) {
    event.target.blur();
    this.item.isReplaceUrl = !this.item.isReplaceUrl;
  }

  noneDisplayClickHandler(event) {
    event.target.blur();
    this.item.isImageOutput = !this.item.isImageOutput;
  }
  
}
