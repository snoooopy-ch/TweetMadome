import {Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform} from '@angular/core';
import {TwitItem} from "../../models/twit-item";
import {DomSanitizer} from "@angular/platform-browser";
import {SimpleItem} from "../../models/pair-item";

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

  @Output() setDraggableEmitter = new EventEmitter();
  @Output() moveTopEmitter = new EventEmitter();
  @Output() moveBottomEmitter = new EventEmitter();
  @Output() deleteEmitter = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    // @ts-ignore
    twttr.widgets.load();
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
}
