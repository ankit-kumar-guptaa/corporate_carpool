import { Directive, HostListener, Input } from '@angular/core';
@Directive({
    selector: '[alphanumeric]'
})
export class AlphanumericDirective {



    regexStr = '^[a-zA-Z0-9 ]+$';
    @Input() isNumeric: boolean = false;

    @HostListener('keypress', ['$event']) onKeyPress(event: any) {
        return new RegExp(this.regexStr).test(event.key);
    }
}