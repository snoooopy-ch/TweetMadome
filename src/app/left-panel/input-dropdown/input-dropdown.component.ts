import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputDropdownComponent,
      multi: true
    }
  ]
})
export class InputDropdownComponent implements ControlValueAccessor, OnInit {

  @Input()
  public dropdownItems: string[];

  isShowDropdown: boolean;

  public inputControl = new FormControl('');

  constructor() {
    this.isShowDropdown = false;
  }

  private itemValue: string;

  public get value(): string {
    return this.itemValue;
  }

  public set value(value: string) {
    console.log(value);
    if (value !== this.itemValue) {
      this.itemValue = value;
      this.onModelUpdate(this.itemValue);
    }
  }

  public writeValue(value: string) {
    value = this.fromNgModel(value);
    if (value !== this.itemValue) {
      this.itemValue = value;
      this.onValueUpdate(this.itemValue);
    }
  }

  public registerOnChange(fn: (value: string) => void) {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: () => void) {
    this.onTouchedCallback = fn;
  }

  protected toNgModel(value: string): string {
    return value;
  }

  protected fromNgModel(value: string): string {
    return value;
  }

  protected onModelUpdate(value: string) {
    this.onChangeCallback(this.toNgModel(value));
    this.onTouchedCallback();
  }

  protected onValueUpdate(value: string): void {
    this.inputControl.setValue(value);
  }

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (value: string) => void = () => { };

  public ngOnInit() {
    this.inputControl.valueChanges.pipe(
    ).subscribe(value => {
      this.value = value;
    });
  }

  onChangeDropdownHandler(item) {
    this.itemValue = item;
    this.onValueUpdate(this.itemValue);
    this.isShowDropdown = false;
  }

  inputClickHandler() {
    this.isShowDropdown = true;
  }
}
