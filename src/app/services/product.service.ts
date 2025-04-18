import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8000/api'; // cambia esto

  constructor(private http: HttpClient) {}

  getProducts(page: number): Observable<{ data: Product[], next_page_url: string | null }> {
    const params = new HttpParams().set('page', page);
    return this.http.get<{ data: Product[], next_page_url: string | null }>(`${this.baseUrl}/products`, { params });
  }
}
