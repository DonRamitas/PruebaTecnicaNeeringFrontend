import { Component, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { Category } from 'src/app/models/category.model';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, funnel, close } from 'ionicons/icons';
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
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, SidemenuComponent, LoadingOverlayComponent, PopupComponent],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})

export class ProductsPage {

  constructor(
    //Servicios para comunicarse con la API
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,

    private router: Router,
    private route: ActivatedRoute

  ) {
    addIcons({ add, menu, search, chevronForwardOutline, funnel, close });
  }

  // Para referenciar elementos del HTML
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('filterButtonRef') filterButtonRef!: ElementRef;
  @ViewChild('ionScroll') infiniteScroll!: IonInfiniteScroll;

  // Almacena los productos y categorías obtenidos de la API
  products: Product[] = [];
  categories: Category[] = [];

  // Sirve para gestionar la paginación y las cargas
  currentPage = 1;
  hasMore = true;
  loading = false;
  logoutLoading = false;

  // Término de búsqueda
  searchTerm: string = '';
  isSearch: boolean = false;

  // Categoría seleccionada para el filtro
  selectedCategory: number | null = null;

  // Indica si el filtro está activo
  isFilterActive: boolean = false;

  // Indica si se está desplegando el dropdown de categorías
  showDropdown: boolean = false;

  // Url de la API Storage
  storagePrefix = environment.apiStoragePrefix;

  // Indica si se está desplegando el Side menu
  isSideMenuOpen = false;

  // Indica si es la primera vez que se cargan los productos y categorías
  firstTime: boolean = true;

  // Se carga todo cuando es primera vez o está activo el flag shouldRefresh
  ionViewWillEnter() {
    this.route.queryParams.pipe(first()).subscribe(params => {
      const shouldRefresh = params['shouldRefresh'] === 'true';
      if (shouldRefresh || this.firstTime) {
        this.products = [];

        this.firstTime = false;

        this.isFilterActive = false;
        this.selectedCategory = null;
        this.searchTerm = '';

        this.currentPage = 1;
        this.hasMore = true;
        this.loading = false;

        this.resetInfiniteScroll();
        this.loadProducts();
        this.loadCategories();
      }
    });
  }

  // Resetea el scroll infinito para evitar bugs
  resetInfiniteScroll() {
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  // Carga las categorías desde la API
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = [{ id: 0, name: 'Todas las categorías' }, ...res];
      },
      error: (err) => {
        this.openPopup('Error', 'No se pudieron cargar las categorías. Código: '+err);
      }
    });
  }

  // Carga los productos desde la API
  loadProducts(event?: any) {
    if (this.loading || !this.hasMore) {
      if (event) event.target.complete();
      return;
    }

    this.loading = true;

    if (!event && this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }

    // Petición al servicio de productos
    this.productService.searchProducts(this.currentPage, this.searchTerm, this.selectedCategory).subscribe({
      next: (res) => {
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
        this.openPopup('Error', 'No se pudieron cargar los productos. Código: ' + err);
        this.loading = false;
        this.hasMore = false;

        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }

        if (event) event.target.complete();
      }
    });
  }

  // Función para realizar la búsqueda
  resetAndSearch() {
    this.products = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.resetInfiniteScroll();

    if (this.searchTerm === '' && !this.selectedCategory) {
      this.isSearch = false;
    } else {
      this.isSearch = true;
    }

    this.loadProducts();
  }

  // Función para limpiar la búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.resetAndSearch();
  }

  // Función para seleccionar una categoría y hacer una búsqueda filtrada
  onCategorySelect(categoryId: number | null) {
    this.selectedCategory = categoryId === 0 ? null : categoryId;
    this.isFilterActive = !!categoryId && categoryId !== 0;
    this.resetAndSearch();
  }

  // Función para cerrar sesión
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
        this.openPopup('Error', 'No se pudo cerrar la sesión.');
      }
    });
  }

  // Listener para detectar pulsaciones fuera del dropdown de categorías para cerrarla
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

  // Botones para ir a otras pantallas
  goCategories() {
    this.router.navigateByUrl('/categories', { replaceUrl: true });
  }

  goAddProduct() {
    this.router.navigate(['/product-add']);
  }

  goToDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }

  // Parámetros para gestionar el popup
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  option1Text = '';

  // Despliega el choose popup
  openPopup(
    title: string = 'Atención',
    description: string = 'Error fatal',
    option1Text: string = 'Volver',
  ) {
    this.showPopup = false;

    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.option1Text = option1Text;
      this.showPopup = true;
    }, 0);
  }
}