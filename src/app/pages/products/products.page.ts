import { Component, OnInit} from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product.model';
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, menu, search, chevronForwardOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})

export class ProductsPage implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  hasMore = true;
  loading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ add, menu, search, chevronForwardOutline });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(event?: any) {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService.getProducts(this.currentPage).subscribe({
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

  logout(){
    this.authService.logout().subscribe(success => {
      if (success) {
        this.router.navigate(['/login']);
      } else {
        console.error('Error al cerrar sesión');
      }
    });
    
  }
}
