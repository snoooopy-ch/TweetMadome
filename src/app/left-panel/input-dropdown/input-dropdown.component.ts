import {Component, forwardRef, HostListener, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDropdownComponent),
      multi: true
    }
  ]
})
export class InputDropdownComponent implements ControlValueAccessor, OnInit {

  @Input()
  public dropdownItems: string[];

  public isShowDropdown: boolean;

  private val: string;

  constructor() {
    this.isShowDropdown = false;
    this.val = '';
  }

  onChange: any = () => {
  }
  onTouch: any = () => {
  }

  set value(val) {
    if (val !== undefined && this.val !== val) {
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    }

  }

  get value() {
    return this.val;
  }

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  public ngOnInit() {
  }

  onChangeDropdownHandler(item) {
    this.writeValue(item);
    this.isShowDropdown = false;
  }

  inputClickHandler() {
    this.isShowDropdown = true;
  }

  @HostListener('focusout')
  setFocusOut(): void {
    setTimeout(this.setShowDropdown.bind(this), 250);
  }

  public setShowDropdown(): void{
    this.isShowDropdown = false;
  }
}
