import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TwitItem} from "../../models/twit-item";

@Component({
  selector: 'app-twit-detail',
  templateUrl: './twit-detail.component.html',
  styleUrls: ['./twit-detail.component.css']
})
export class TwitDetailComponent implements OnInit {

  @Input() item: TwitItem;
  @Input() twitIndex: number;

  @Output() setDraggableEmitter = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
