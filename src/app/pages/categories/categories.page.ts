import { Component, ViewChild } from '@angular/core';
import { Category } from 'src/app/models/category.model';
import { IonicModule, IonInfiniteScroll } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline, close, createOutline, trashOutline, create } from 'ionicons/icons';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Agrega si no está
import { CategoryService } from 'src/app/services/category.service';
import { SidemenuComponent } from 'src/app/components/side-menu/side-menu.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { first } from 'rxjs';
import { ChoosePopupComponent } from 'src/app/components/choose-popup/choose-popup.component';
import { PopupComponent } from 'src/app/components/popup/popup.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, SidemenuComponent, LoadingOverlayComponent, ChoosePopupComponent, PopupComponent],
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})

export class CategoriesPage {

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    addIcons({ add, menu, search, chevronForwardOutline, close, createOutline, trashOutline });
  }

  // Para conectarse con el scroll infinito del html
  @ViewChild('ionScroll') infiniteScroll!: IonInfiniteScroll;

  // Almacena las categorías obtenidas desde la API
  categories: Category[] = [];

  // Contra la paginación y cargas
  currentPage = 1;
  hasMore = true;
  loading = false;

  // Término de búsqueda ingresado
  searchTerm: string = '';

  // Indica si el usuario buscó algo
  isSearch: boolean = false;

  // Indica si se está cargando un logout o la eliminación de una categoría
  logoutLoading = false;
  deleteLoading = false;

  // Indica si es primera vez que se cargan las categorías
  firstTime: Boolean = true;

  // Almacena el id de la categoría seleccionada
  selectedCategoryId: number | null = null;

  // Gestiona el Side menu
  isSideMenuOpen = false;

  // Si se abre la página y es primera vez que se entra o se desea recargar, recargar la vista
  ionViewWillEnter() {
    this.route.queryParams.pipe(first()).subscribe(params => {
      const shouldRefresh = params['shouldRefresh'] === 'true';
      if (shouldRefresh || this.firstTime) {
        this.firstTime = false;
        this.resetView();
      }
    });
  }

  // Resetea la búsqueda y carga de nuevo las categorías actualizadas
  resetView() {
    this.categories = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.searchTerm = '';
    this.isSearch = false;
    this.resetInfiniteScroll();
    this.loadCategories();
  }

  // Resetea el scroll infinito para evitar bugs
  resetInfiniteScroll() {
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
  }

  // Carga las categorías desde la API y las despliega
  async loadCategories(event?: any) {
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
      error: (err) => {
        this.openSimplePopup('Error', 'No se pudieron cargar las categorías. Código: ' + err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  // Parámetros para gestionar el choose popup
  showChoosePopup = false;
  showSimplePopup = false;
  popupTitle = '';
  popupDescription = '';
  option1Text = '';
  option2Text = '';

  // Despliega el choose popup
  openChoosePopup(
    title: string = 'Eliminar categoría',
    description: string = '¿Estás seguro que deseas eliminar la categoría?',
    option1Text: string = 'Cancelar',
    option2Text: string = 'Sí, eliminar'
  ) {
    this.showChoosePopup = false;

    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.option1Text = option1Text;
      this.option2Text = option2Text;
      this.showChoosePopup = true;
    }, 0);
  }

  // Despliega el choose popup
  openSimplePopup(
    title: string = 'Error',
    description: string = 'No deberías ver este mensaje',
    option1Text: string = 'Volver',
  ) {
    this.showSimplePopup = false;

    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.option1Text = option1Text;
      this.showSimplePopup = true;
    }, 0);
  }

  // Abre la confirmación de eliminación de la categoría
  tryDelete(id: number) {
    this.selectedCategoryId = id;
    this.openChoosePopup();
  }

  // Botón cancelar
  selectOption1() {
    this.showChoosePopup = false;
  }

  // Botón eliminar
  selectOption2() {
    this.showChoosePopup = false;
    this.deleteLoading = true;
    this.categoryService.deleteCategory(this.selectedCategoryId!).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.resetView();
      },
      error: (err) => {
        this.openSimplePopup('Error', 'No se pudo eliminar la categoría. Código: ' + err);
      }
    });
  }

  // Botón para buscar y cargar los resultados de esa búsqueda
  resetAndSearch() {
    this.categories = [];
    this.currentPage = 1;
    this.hasMore = true;
    if (this.searchTerm == '') {
      this.isSearch = false;
    } else {
      this.isSearch = true;
    }
    this.loadCategories();
  }

  // Botón para reiniciar la búsqueda
  clearSearch() {
    this.resetView();
  }

  // Método del Sidemenu, para cerrar sesión
  logout() {
    this.logoutLoading = true;
    this.authService.logout().subscribe(success => {
      if (success) {
        this.searchTerm = '';
        this.logoutLoading = false;
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        this.logoutLoading = false;
        this.openSimplePopup('Error', 'No se pudo cerrar la sesión.');
      }
    });

  }

  // Botones para navegar a otras pantallas
  goProducts() {
    this.router.navigateByUrl('/products', { replaceUrl: true });
  }

  goAddCategory() {
    this.router.navigate(['/category-add']);
  }

  goEditCategory(id: Number) {
    this.router.navigate(['/category-edit', id]);
  }
}
