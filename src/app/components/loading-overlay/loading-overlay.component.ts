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
  @Input() isLoading: boolean = false;
}
