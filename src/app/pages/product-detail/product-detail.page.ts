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

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PopupComponent
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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
  }

  fromAddProduct:boolean = false;
  
  product: Product | null = null;
  storagePrefix = 'http://localhost:8000/storage/'; // o donde tengas tus imágenes

  loadProduct(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (res) => this.product = res,
      error: (err) => console.error('Error al cargar producto', err)
    });
  }

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';
  popupHeaderColor = '';

  openPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'OK',
    headerColor: string = 'bg-fuchsia-800'
  ) {
    // Oculta primero por si ya estaba visible
    this.showPopup = false;

    // Usa un pequeño timeout para esperar al siguiente ciclo de render
    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.popupButtonText = buttonText;
      this.popupHeaderColor = headerColor;
      this.showPopup = true;
    }, 0);
  }

  goBack() {
    this.router.navigate(['/products'], { state: { refresh: true } });
  }

}
