import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PopupComponent {

  constructor() {
    addIcons({ closeOutline });
  }

  // Valores que obtiene el popup para desplegarse
  @Input() title: string = 'Error';
  @Input() description: string = 'Ha ocurrido un error.';
  @Input() buttonText: string = 'Entiendo';
  @Input() visible: boolean = false;
  @Output() onConfirm = new EventEmitter<void>();

  // Evento que se lanza al presionar el único botón
  handleClick() {
    this.onConfirm.emit();
  }

}
