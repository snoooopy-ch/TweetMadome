import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LeftPanelComponent} from './left-panel/left-panel.component';
import {RightPanelComponent} from './right-panel/right-panel.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {TwitDetailComponent, SafeHtmlPipe} from './left-panel/twit-detail/twit-detail.component';
import {HotkeyModule} from 'angular2-hotkeys';
import {TypeaheadModule} from 'ngx-bootstrap/typeahead';
import { InputDropdownComponent } from './left-panel/input-dropdown/input-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    LeftPanelComponent,
    RightPanelComponent,
    TwitDetailComponent,
    SafeHtmlPipe,
    InputDropdownComponent
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    HotkeyModule.forRoot(),
    ReactiveFormsModule,
    VirtualScrollerModule,
    ButtonsModule,
    TypeaheadModule.forRoot(),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
