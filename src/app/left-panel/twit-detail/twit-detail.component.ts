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
import {VirtualScrollerComponent} from "ngx-virtual-scroller";

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

  @ViewChild('tweetContent') tweetContent: ElementRef;

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    // @ts-ignore
    twttr.widgets.load();

    if(this.selectedCon > 0){
      this.item.container = this.conList[this.selectedCon-1].value;
      this.item.containerColor = this.conList[this.selectedCon-1].color;
    }
    if(this.selectedPict > 0) {
      this.item.picture = this.picList[this.selectedPict - 1].value;
      this.item.pictureColor = this.picList[this.selectedPict - 1].color;
    }

    console.log(this.showCheckColor);
  }

  btnMoveTopClickHandler() {
    this.moveTopEmitter.emit();
  }

  btnMoveBottomClickHandler() {
    this.moveBottomEmitter.emit();
  }

  btnDeleteClickHandler() {
    this.deleteEmitter.emit();
  }

  optContainerClickHandler(conItem: SimpleItem) {
    this.item.containerColor = conItem.color;
  }

  optPictureClickHandler(picItem: SimpleItem) {
    this.item.pictureColor = picItem.color;
  }
}
