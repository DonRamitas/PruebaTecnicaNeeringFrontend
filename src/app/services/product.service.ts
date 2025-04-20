import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';
import { tap, catchError, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8000/api'; // cambia esto

  constructor(private http: HttpClient) {}

  searchProducts(page: number, search: string, categoryId: number | null): Observable<{ data: Product[], next_page_url: string | null }> {
    let params = new HttpParams().set('page', page);
  
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('category_id', categoryId);
  
    return this.http.get<{ data: Product[], next_page_url: string | null }>(`${this.baseUrl}/products`, { params });
  }

  addProduct(product: Product) {
      return this.http.post<Product>(`${this.baseUrl}/products`, product)
    }
  
}
