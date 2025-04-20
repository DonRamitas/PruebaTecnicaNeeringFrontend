import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router } from '@angular/router';

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
  @Output() onConfirm = new EventEmitter<void>();

  handleClick() {
    this.onConfirm.emit(); // Lanza el evento cuando se hace clic
  }

  constructor(
    private router:Router
  ){

  }
}
