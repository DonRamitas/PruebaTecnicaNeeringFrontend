import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './template.page.html',
  styleUrls: ['./template.page.scss'],

})
export class TemplatePage {
  

  constructor(
    private router: Router,

  ) {
    addIcons({ arrowBack });
  }

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';
  popupHeaderColor = '';

  openPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'OK',
    headerColor: string = 'bg-fuchsia-800'
  ) {
    // Oculta primero por si ya estaba visible
    this.showPopup = false;

    // Usa un pequeño timeout para esperar al siguiente ciclo de render
    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.popupButtonText = buttonText;
      this.popupHeaderColor = headerColor;
      this.showPopup = true;
    }, 0);
  }

}
