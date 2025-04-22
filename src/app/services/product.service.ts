import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// Servicio para comunicarse con la API y gestionar los productos
export class ProductService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Busca entre los productos según un término de búsqueda y una categoría en particular (opcional), retornando un array de productos
  searchProducts(page: number, search: string, categoryId: number | null): Observable<{ data: Product[], next_page_url: string | null }> {
    let params = new HttpParams().set('page', page);
  
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('category_id', categoryId);
  
    return this.http.get<{ data: Product[], next_page_url: string | null }>(`${this.baseUrl}/products`, { params });
  }

  // Añade un producto
  addProduct(product: FormData) {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  // Obtiene un producto en específico
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // Elimina un producto
  deleteProduct(id: number){
    return this.http.delete<Product>(`${this.baseUrl}/products/${id}`);
  }

  // Almacena los datos de un producto
  updateProduct(id: number, product: FormData){
    return this.http.post<Product>(`${this.baseUrl}/products/${id}`, product);
  }
}
