import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-choose-popup',
  templateUrl: './choose-popup.component.html',
  styleUrls: ['./choose-popup.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass, IonicModule]
})
export class ChoosePopupComponent {
  @Input() title: string = 'Error';
  @Input() description: string = 'Ha ocurrido un error.';
  @Input() option1Text: string = 'Entiendo';
  @Input() option2Text: string = 'No entiendo';
  @Input() visible: boolean = false;
  @Output() onOption1 = new EventEmitter<void>();
  @Output() onOption2 = new EventEmitter<void>();
  @Input() headerColor: string = 'bg-fuchsia-700';

  handleOption1() {
    this.onOption1.emit(); // Lanza el evento cuando se hace clic
  }

  handleOption2() {
    this.onOption2.emit(); // Lanza el evento cuando se hace clic
  }

  constructor(){
    addIcons({closeOutline});
  }
}
