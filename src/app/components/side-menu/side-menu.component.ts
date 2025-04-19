import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, notificationsOutline, heartOutline, pricetagsOutline, personOutline, cartOutline, albumsOutline, storefrontOutline, helpCircleOutline, logOutOutline} from 'ionicons/icons';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SidemenuComponent {
  @Input() isOpen = true;
  @Input() userName = 'Nombre Usuario';
  @Input() userImage = 'https://via.placeholder.com/100';
  @Output() logout = new EventEmitter<void>();
  @Output() closeSidemenu = new EventEmitter<void>();
  @Output() goCategories= new EventEmitter<void>();
  @Output() goProducts = new EventEmitter<void>();

  constructor(){
    addIcons({homeOutline, searchOutline, notificationsOutline, heartOutline, pricetagsOutline, personOutline, cartOutline, albumsOutline, storefrontOutline, helpCircleOutline, logOutOutline});
  }

  logoutSession(){
    this.logout.emit();
  }

  letsGoCategories(){
    this.goCategories.emit();
  }

  letsGoProducts(){
    this.goProducts.emit();
  }

  closeMenu(){
    this.closeSidemenu.emit();
  }
}
