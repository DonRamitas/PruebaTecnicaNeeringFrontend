import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  templateUrl: './loading-overlay.component.html',
  styleUrls: [],
  imports: [
    CommonModule
  ]
})
export class LoadingOverlayComponent {

  // Valor que controla si mostrar o no el cover de carga
  @Input() isLoading: boolean = false;
}
