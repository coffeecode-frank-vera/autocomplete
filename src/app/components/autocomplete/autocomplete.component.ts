import { CommonModule } from "@angular/common";
import { Component, computed, EventEmitter, forwardRef, Input, OnInit, Output, signal, WritableSignal } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-autocomplete',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutocompleteComponent),
            multi: true
        }
    ]
})
export class AutocompleteComponent implements ControlValueAccessor, OnInit {
    @Input() placeholder: string = '';
    @Input() label: string = '';
    @Input() resultsLimit: number = 0;
    @Input() filterMinChars: number = 0;
    @Input() fixedList: { text: string, [key: string]: any }[] = [];
    @Input() filteredList: WritableSignal<{ text: string, [key: string]: any }[]> = signal([]);
    @Input() clearIfNoMatch: boolean = false;
    @Input() position: 'top' | 'bottom' = 'bottom';
    @Input() disabled: boolean = false;
    @Input() customClasses: string[] = [];
    @Input() id: string = 'autocomplete_component';
    @Input() name: string = 'autocomplete';
    @Input() required: boolean = false;
    @Input() readonly: boolean = false;
    @Input() autofocus: boolean = false;
    @Input() autocomplete: 'on' | 'off' = 'off';
    @Input() type: string = 'text';
    @Input() iconUrl: string = '';
    @Input() showIcon: WritableSignal<boolean> = signal(false);

    @Output() focus = new EventEmitter<{event: FocusEvent}>();
    @Output() blur = new EventEmitter<FocusEvent>();
    @Output() input = new EventEmitter<{event: Event, text: string}>();
    @Output() select = new EventEmitter<{ text: string, [key: string]: any }>();

    _value: { text: string, [key: string]: any } = { text: '' };
    text: string = '';
    isFixedList: boolean = false;
    isFocused: WritableSignal<boolean> = signal(false);
    
    limitedList = computed(() => this.resultsLimit > 0 ? this.filteredList().slice(0, this.resultsLimit) : this.filteredList());
    showList = computed(() => this.isFocused() && this.value.text.length >= this.filterMinChars && this.filteredList().length > 0);

    constructor() {}

    ngOnInit(): void {
        if (this.fixedList.length > 0) {
            this.isFixedList = true;
            this.filteredList.set(this.fixedList);
        }
    }

    /**
     * ngModel value getter
     */
    public get value(){
        return this._value;
    }

    /**
     * ngModel value setter
     */
    public set value(v){
        this._value = v;
        this.onChange(this._value);
        this.onTouched();
    }

    /*
        Angular Forms ControlValueAccessor interface methods
    */
    writeValue(obj: any): void {
        this._value = obj;
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        // Use it if needed
    }

    onChange: any = () => { };

    onTouched: any = () => { };

    /**
        Event handlers
    */

    onFocus(event: FocusEvent) {
        console.log('focus');
        this.isFocused.set(true);
        this.focus.emit({event: event});
    }

    onBlur(event: FocusEvent) {
        console.log('blur', event);
        setTimeout(() => {
            this.clearInputIfNotExist();
            this.isFocused.set(false);
        }, 100); // Debouncer for click event
        this.blur.emit(event);
    }

    onInput(event: Event) {
        this.filterList();
        this.input.emit({event: event, text: this.text});
    }

    onSelect(item: { text: string, [key: string]: any }) {
        this.text = item.text;
        this.value = {...item};
        this.filterList();
        this.select.emit(item);
    }

    clearInputIfNotExist() {
        if (!this.clearIfNoMatch) {
            return;
        }

        const found = this.filteredList().find(item => item.text === this._value.text);
        if (!found) {
            this.value = { text: '' };
        }
    }

    filterList() {
        if (this.isFixedList && this.text.length >= this.filterMinChars) {
            this.filteredList.set(this.fixedList.filter(item => item.text.toLowerCase().includes(this.text.toLowerCase())));
        }
    }

    isOptionSelected(item: { text: string, [key: string]: any }) {
        return this._value.text === item.text;
    }
}
