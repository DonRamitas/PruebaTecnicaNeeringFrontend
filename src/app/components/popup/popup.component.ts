import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass]
})
export class PopupComponent {
  @Input() title: string = 'Error';
  @Input() description: string = 'Ha ocurrido un error.';
  @Input() buttonText: string = 'Entiendo';
  @Input() headerColor: string = 'bg-fuchsia-700';
  @Input() visible: boolean = false;

  close() {
    this.visible = false;
  }
}
