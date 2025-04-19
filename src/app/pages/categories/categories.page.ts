import { Component, OnInit} from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, close, createOutline, trashOutline, create} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Agrega si no está
import { CategoryService } from 'src/app/services/category.service';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidemenuComponent } from 'src/app/components/side-menu/side-menu.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, SidemenuComponent, LoadingOverlayComponent],
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})

export class CategoriesPage implements OnInit {
  categories: Category[] = [];
  currentPage = 1;
  hasMore = true;
  loading = false;
  searchTerm: string = '';
  isSearch: boolean = false;
  logoutLoading = false;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ add, menu, search, chevronForwardOutline, close, createOutline, trashOutline });
  }

  ngOnInit() {
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.loadCategories();
  }

  loadCategories(event?: any) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.categoryService.searchCategories(this.currentPage, this.searchTerm).subscribe({
      next: (res) => {
        this.categories.push(...res.data);
        this.hasMore = !!res.next_page_url;
        this.currentPage++;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  /*loadCategories(event?: any) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.categoryService.getCategories().subscribe((res) => {
      this.categories = [ ...res];
    });
  }*/

  resetAndSearch() {
    this.categories = [];
    this.currentPage = 1;
    this.hasMore = true;
    if(this.searchTerm==''){
      this.isSearch = false;
    }else{
      this.isSearch = true;
    }
    this.loadCategories();
  }

  onSearchClick() {
    this.resetAndSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.resetAndSearch(); // Esto ya se encarga de cargar productos con search vacío y categoría activa
  }

  logout(){
    this.logoutLoading =true;
    this.authService.logout().subscribe(success => {
      if (success) {
        this.searchTerm = '';
        this.logoutLoading = false;
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        this.logoutLoading = false;
        //TODO: handlear esto, en products page igual
        console.error('Error al cerrar sesión');
      }
    });
    
  }

  isSideMenuOpen = false;

  openSideMenu() {
    this.isSideMenuOpen = true;
    
  }

  closeSideMenu() {
    this.isSideMenuOpen = false;
  }

  goProducts(){
    this.router.navigateByUrl('/products', { replaceUrl: true });
  }
}
