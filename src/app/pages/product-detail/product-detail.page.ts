import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, createOutline, trashOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { ChoosePopupComponent } from 'src/app/components/choose-popup/choose-popup.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PopupComponent,
    ChoosePopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],

})
export class ProductDetailPage implements OnInit {

  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
    addIcons({ arrowBack, createOutline, trashOutline });
  }

  productId:number = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.productId = +id;
    }
  }

  ionViewWillEnter(){
    this.route.queryParams.subscribe(params => {
      this.shouldRefresh = params['shouldRefresh'] === 'true';
    });

    if(this.shouldRefresh){
      this.loadProduct(this.productId);
    }
  }

  shouldRefresh:boolean = false;

  loading:boolean = false;
  
  product: Product | null = null;
  storagePrefix = 'http://localhost:8000/storage/'; // o donde tengas tus imágenes

  loadProduct(id: number) {
    this.loading=true;
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product = res;
        this.loading=false;
      },
      error: (err) => console.error('Error al cargar producto', err)
    });
  }

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  option1Text = '';
  option2Text = '';

  openPopup(
    title: string = 'Eliminar producto',
    description: string = '¿Estás seguro que deseas eliminar el producto?',
    option1Text: string = 'Cancelar',
    option2Text: string = 'Sí, eliminar'
  ) {
    // Oculta primero por si ya estaba visible
    this.showPopup = false;

    // Usa un pequeño timeout para esperar al siguiente ciclo de render
    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.option1Text = option1Text;
      this.option2Text = option2Text;
      this.showPopup = true;
    }, 0);
  }

  goBack() {
    if (this.shouldRefresh) {
      this.router.navigate(['/products'], {
        queryParams: { shouldRefresh: true },
        replaceUrl: true // ← para no volver al detalle otra vez
      });
    } else {
      this.router.navigateByUrl('/products',{replaceUrl: true});
    }
  }

  goEdit(){
    this.router.navigate(['/product-edit', this.productId]);
  }

  tryDelete(){
    this.openPopup();
  }

  selectOption1(){
    this.showPopup = false;
  }

  selectOption2(){
    this.loading = true;
    this.productService.deleteProduct(this.productId).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products'], {
          queryParams: { shouldRefresh: true },
          replaceUrl: true // ← para no volver al detalle otra vez
        });
      },
      error: (err) => console.error('Error al cargar producto', err)
    });
  }

}
