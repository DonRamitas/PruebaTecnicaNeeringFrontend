import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, createOutline, trashOutline } from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { ChoosePopupComponent } from 'src/app/components/choose-popup/choose-popup.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { PopupComponent } from 'src/app/components/popup/popup.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ChoosePopupComponent,
    LoadingOverlayComponent,
    PopupComponent
  ],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],

})
export class ProductDetailPage implements OnInit {

  constructor(

    private router: Router,
    private route: ActivatedRoute,

    // Utiliza el servicio de productos para recibir los datos
    private productService: ProductService
  ) {
    addIcons({ arrowBack, createOutline, trashOutline });
  }

  // Almacena el ID del producto recibida de la pantalla anterior
  productId: number = 0;

  // Producto principal
  product: Product | null = null;

  // Indica cuando se está cargando información
  loading: boolean = false;

  // Url API storage
  storagePrefix = 'http://localhost:8000/storage/';

  // Al cargar el componente recibe el id del producto desde la pantalla anterior
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.productId = +id;
    }
  }

  // Cuando se entra a la página decide si recargar todo o no
  shouldRefresh: boolean = false;
  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.shouldRefresh = params['shouldRefresh'] === 'true';
    });

    if (this.shouldRefresh) {
      this.loadProduct(this.productId);
    }
  }

  // Carga el producto y lo almacena en una variable
  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product = res;
        this.loading = false;
      },
      error: (err) => {
        this.openSimplePopup('Error', 'No se pudo cargar el producto. Código: ' + err);
      }
    });
  }

  // Gestión de los popup
  showSimplePopup = false;
  showChoosePopup = false;
  popupTitle = '';
  popupDescription = '';
  option1Text = '';
  option2Text = '';

  openSimplePopup(
    title: string = 'Error fatal',
    description: string = 'Algo falló',
    option1Text: string = 'Rendirse'
  ) {
    this.showSimplePopup = false;

    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.option1Text = option1Text;
      this.showSimplePopup = true;
    }, 0);
  }

  openChoosePopup(
    title: string = 'Eliminar producto',
    description: string = '¿Estás seguro que deseas eliminar el producto?',
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

  // Se devuelve a la página de productos, y la recarga si modificó el producto
  goBack() {
    if (this.shouldRefresh) {
      this.router.navigate(['/products'], {
        queryParams: { shouldRefresh: true },
        replaceUrl: true
      });
    } else {
      this.router.navigateByUrl('/products', { replaceUrl: true });
    }
  }

  // Ir a modificar el producto
  goEdit() {
    this.router.navigate(['/product-edit', this.productId]);
  }

  // Abre la confirmación para borrar el producto
  tryDelete() {
    this.openChoosePopup();
  }

  // Cerrar el popup
  selectOption1() {
    this.showSimplePopup = false;
    this.showChoosePopup = false;
  }

  // Eliminar el producto y volver a la pantalla principal
  selectOption2() {
    this.loading = true;
    this.productService.deleteProduct(this.productId).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products'], {
          queryParams: { shouldRefresh: true },
          replaceUrl: true // ← para no volver al detalle otra vez
        });
      },
      error: (err) => {
        this.openSimplePopup('Error', 'No se pudo eliminar el producto. Código: ' + err);
      }
    });
  }

}
