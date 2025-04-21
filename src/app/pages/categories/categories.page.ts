import { Component, OnInit} from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, close, createOutline, trashOutline, create} from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Agrega si no está
import { CategoryService } from 'src/app/services/category.service';
import { ElementRef, HostListener, ViewChild } from '@angular/core';
import { SidemenuComponent } from 'src/app/components/side-menu/side-menu.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { first } from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';
import { ChoosePopupComponent } from 'src/app/components/choose-popup/choose-popup.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, SidemenuComponent, LoadingOverlayComponent, ChoosePopupComponent],
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})

export class CategoriesPage {
  @ViewChild('ionScroll') infiniteScroll!: IonInfiniteScroll;
  categories: Category[] = [];
  currentPage = 1;
  hasMore = true;
  loading = false;
  searchTerm: string = '';
  isSearch: boolean = false;
  logoutLoading = false;
  deleteLoading = false;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    addIcons({ add, menu, search, chevronForwardOutline, close, createOutline, trashOutline });
  }

  firstTime:Boolean = true;

  ionViewWillEnter() {
      this.route.queryParams.pipe(first()).subscribe(params => {
        const fromAddCategory = params['fromAddCategory'] === 'true';
        if (fromAddCategory || this.firstTime) {
          this.firstTime = false;
          this.resetView();
        }
      });
    }

    resetView(){
      this.categories = [];
      this.currentPage = 1;
      this.hasMore = true;
      this.loading = false;
      this.searchTerm = '';
      this.resetInfiniteScroll();
      this.loadCategories();
    }

    resetInfiniteScroll() {
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = false;
      }
    }

    showPopup = false;
    popupTitle = '';
    popupDescription = '';
    option1Text = '';
    option2Text = '';
    popupHeaderColor = '';
  
    openPopup(
      title: string = 'Eliminar categoría',
      description: string = '¿Estás seguro que deseas eliminar la categoría?',
      option1Text: string = 'Volver',
      option2Text: string = 'Eliminar',
      headerColor: string = 'bg-fuchsia-800'
    ) {
      // Oculta primero por si ya estaba visible
      this.showPopup = false;
  
      // Usa un pequeño timeout para esperar al siguiente ciclo de render
      setTimeout(() => {
        this.popupTitle = title;
        this.popupDescription = description;
        this.option1Text = option1Text;
        this.option2Text = option2Text;
        this.popupHeaderColor = headerColor;
        this.showPopup = true;
      }, 0);
    }

    tryDelete(id:number){
      this.categoryId = id;
      this.openPopup();
    }

    selectOption1(){
      this.showPopup = false;
    }
  
    selectOption2(){
      this.showPopup=false;
      this.deleteLoading = true;
      this.categoryService.deleteCategory(this.categoryId!).subscribe({
        next: () => {
          this.categories = [];
          this.deleteLoading = false;
          this.resetView();
        },
        error: () => {}//console.error('Error al cargar categoría', err)
      });
    }

  categoryId:number | null = null;
  

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

  goAddCategory() {
    this.router.navigate(['/category-add']);
  }

  goEditCategory(id:Number){
    this.router.navigate(['/category-edit',id]);
  }
}
