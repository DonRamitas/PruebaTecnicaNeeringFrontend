import { Component, OnInit} from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, funnel, close } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Agrega si no está
import { CategoryService } from 'src/app/services/category.service';
import { ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})

export class ProductsPage implements OnInit {
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('filterButtonRef') filterButtonRef!: ElementRef;
  products: Product[] = [];
  categories: any[] = [];
  currentPage = 1;
  hasMore = true;
  loading = false;
  searchTerm: string = '';
  selectedCategory: string | null = null;
  isFilterActive: boolean = false;
  showDropdown: boolean = false;
  isSearch: boolean = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ add, menu, search, chevronForwardOutline, funnel, close });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  ionViewWillEnter() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res) => {
      this.categories = [{ id: null, name: 'Todas las categorías' }, ...res];
    });
  }

  loadProducts(event?: any) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService.searchProducts(this.currentPage, this.searchTerm, this.selectedCategory).subscribe({
      next: (res) => {
        this.products.push(...res.data);
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

  resetAndSearch() {
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;
    if(this.searchTerm=='' && !this.selectedCategory){
      this.isSearch = false;
    }else{
      this.isSearch = true;
    }
    this.loadProducts();
  }

  onEnterPress(event: KeyboardEvent) {
    if (this.searchTerm.trim()) {
      this.resetAndSearch();
    }
  }

  onSearchClick() {
    this.resetAndSearch();
  }

  clearSearch() {
    this.searchTerm = '';
    this.resetAndSearch(); // Esto ya se encarga de cargar productos con search vacío y categoría activa
  }

  onCategorySelect(categoryId: string | null) {
    this.selectedCategory = categoryId;
    this.isFilterActive = !!categoryId;
    this.resetAndSearch();
  }

  logout(){
    this.authService.logout().subscribe(success => {
      if (success) {
        this.searchTerm = '';
        this.selectedCategory = null;
        this.isFilterActive = false;
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
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

    // Si no hizo clic dentro del dropdown ni en el botón, cerramos el dropdown
    if (!clickedInsideDropdown && !clickedFilterButton) {
      // Solo cerrar el dropdown, sin afectar el clic
      this.showDropdown = false;
    }
  }
}
