import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';


@Component({
    selector: 'AutocompleteComponent',
    styleUrls: ['./autocomplete.component.scss'],
    template: `
     
       
      <input #inputElement
        type="text" 
        [(ngModel)]="autocompleteInput"  class="form-control form-input"
        #addresstext
        >
             
    `
    
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
    @Input() adressType: string ="geocode";
  
    @Output() setAddress: EventEmitter<any> = new EventEmitter();
    @ViewChild('addresstext') addresstext: any;
    @ViewChild('inputElement', { static: false }) inputElement!: ElementRef;

    @Input()  autocompleteInput:any;
    queryWait: boolean = false;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.getPlaceAutocomplete();
        }, 2000);
       
    }

    private getPlaceAutocomplete() {
        const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
            {
                componentRestrictions: { country: 'IN' },
                types: [this.adressType]  // 'establishment' / 'address' / 'geocode'
            });
              google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            this.invokeEvent(place);
        });
    }

    invokeEvent(place: Object) {
        this.setAddress.emit(place);
    }


    focusInput() {
        this.inputElement.nativeElement.focus();  // This focuses the input field inside the component
      }

}