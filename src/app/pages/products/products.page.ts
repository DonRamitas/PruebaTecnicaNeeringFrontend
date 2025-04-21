import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { Category } from 'src/app/models/category.model';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, funnel, close} from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { ElementRef, HostListener } from '@angular/core';
import { SidemenuComponent } from 'src/app/components/side-menu/side-menu.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { first } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, SidemenuComponent, LoadingOverlayComponent],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})

export class ProductsPage {
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('filterButtonRef') filterButtonRef!: ElementRef;
  @ViewChild('ionScroll') infiniteScroll!: IonInfiniteScroll;
  
  products: Product[] = [];
  categories: Category[] = [];
  currentPage = 1;
  hasMore = true;
  loading = false;
  searchTerm: string = '';
  selectedCategory: number | null = null;
  isFilterActive: boolean = false;
  showDropdown: boolean = false;
  isSearch: boolean = false;
  logoutLoading = false;
  storagePrefix = 'http://localhost:8000/storage/';
  isSideMenuOpen = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    addIcons({ add, menu, search, chevronForwardOutline, funnel, close });
  }

  firstTime:boolean = true;

  ionViewWillEnter() {
    this.route.queryParams.pipe(first()).subscribe(params => {
      const fromAddProduct = params['fromAddProduct'] === 'true';
      if (fromAddProduct || this.firstTime) {
        this.firstTime = false;
        this.isFilterActive = false;
        this.selectedCategory = null;
        this.products = [];
        this.currentPage = 1;
        this.hasMore = true;
        this.loading = false;
        this.searchTerm = '';
        this.resetInfiniteScroll();
        this.loadProducts();
        this.loadCategories();
      }
    });
  }

  
  
  resetInfiniteScroll() {
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe((res) => {
      this.categories = [{ id: 0, name: 'Todas las categorías' }, ...res];
    });
  }

  loadProducts(event?: any) {
    if (this.loading || !this.hasMore) {
      if (event) event.target.complete();
      return;
    }
  
    this.loading = true;
  
    if (!event && this.infiniteScroll) {
      this.infiniteScroll.disabled = true; // <- Detén scroll hasta que termine
    }
  
    console.log('Loading products, page:', this.currentPage);
  
    this.productService.searchProducts(this.currentPage, this.searchTerm, this.selectedCategory).subscribe({
      next: (res) => {
        console.log('API response:', res);
        if (res.data && res.data.length > 0) {
          this.products.push(...res.data);
          this.hasMore = !!res.next_page_url;
          this.currentPage++;
        } else {
          this.hasMore = false;
        }
  
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = !this.hasMore;
        }
  
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
        this.hasMore = false;
  
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
  
        if (event) event.target.complete();
      }
    });
  }
  

  resetAndSearch() {
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.resetInfiniteScroll();
    
    if(this.searchTerm === '' && !this.selectedCategory) {
      this.isSearch = false;
    } else {
      this.isSearch = true;
    }
    
    this.loadProducts();
  }

  onSearchClick() {
    this.resetAndSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.resetAndSearch();
  }

  onCategorySelect(categoryId: number | null) {
    this.selectedCategory = categoryId === 0 ? null : categoryId;
    this.isFilterActive = !!categoryId && categoryId !== 0;
    this.resetAndSearch();
  }

  logout() {
    this.logoutLoading = true;
    this.authService.logout().subscribe(success => {
      if (success) {
        this.searchTerm = '';
        this.selectedCategory = null;
        this.isFilterActive = false;
        this.logoutLoading = false;
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        this.logoutLoading = false;
        console.error('Error al cerrar sesión');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const dropdownEl = this.dropdownRef?.nativeElement;
    const buttonEl = this.filterButtonRef?.nativeElement;
    const clickedInsideDropdown = dropdownEl?.contains(event.target);
    const clickedFilterButton = buttonEl?.contains(event.target);

    if (!clickedInsideDropdown && !clickedFilterButton) {
      this.showDropdown = false;
    }
  }

  openSideMenu() {
    this.isSideMenuOpen = true;
  }

  closeSideMenu() {
    this.isSideMenuOpen = false;
  }

  goCategories() {
    this.router.navigateByUrl('/categories', { replaceUrl: true });
  }

  goAddProduct() {
    this.router.navigate(['/product-add']);
  }

  goToDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }
}