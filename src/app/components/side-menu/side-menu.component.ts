import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, notificationsOutline, heartOutline, pricetagsOutline, personOutline, cartOutline, albumsOutline, storefrontOutline, helpCircleOutline, logOutOutline} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidemenu',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SidemenuComponent implements OnInit {
  @Input() isOpen = true;
  @Output() logout = new EventEmitter<void>();
  @Output() closeSidemenu = new EventEmitter<void>();
  @Output() goCategories= new EventEmitter<void>();
  @Output() goProducts = new EventEmitter<void>();

  constructor(
    private authService:AuthService,
  ){
    addIcons({homeOutline, searchOutline, notificationsOutline, heartOutline, pricetagsOutline, personOutline, cartOutline, albumsOutline, storefrontOutline, helpCircleOutline, logOutOutline});
  }

  username:string = '';

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.username = response.name;
      }
  });}

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
