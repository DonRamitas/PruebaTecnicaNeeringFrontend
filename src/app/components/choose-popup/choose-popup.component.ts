import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-choose-popup',
  templateUrl: './choose-popup.component.html',
  styleUrls: ['./choose-popup.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ChoosePopupComponent {

  constructor() {
    addIcons({ closeOutline });
  }

  // Valores que obtiene el popup para desplegarse
  @Input() title: string = 'Error';
  @Input() description: string = 'No deberías ver este mensaje.';
  @Input() option1Text: string = 'Volver';
  @Input() option2Text: string = 'Volver x2';
  @Input() visible: boolean = false;
  @Output() onOption1 = new EventEmitter<void>();
  @Output() onOption2 = new EventEmitter<void>();

  // Eventos que se disparan al seleccionar una de las opciones
  handleOption1() {
    this.onOption1.emit();
  }

  handleOption2() {
    this.onOption2.emit();
  }
}
