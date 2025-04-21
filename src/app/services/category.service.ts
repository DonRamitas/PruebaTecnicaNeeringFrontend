import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  searchCategories(page: number, search: string): Observable<{ data: Category[], next_page_url: string | null }> {
    let params = new HttpParams().set('page', page);
  
    if (search) params = params.set('search', search);
  
    return this.http.get<{ data: Category[], next_page_url: string | null }>(`${this.baseUrl}/categories`, { params });
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/all`);
  }

  addCategory(category: any) {
    return this.http.post<any>(`${this.baseUrl}/categories`, category);
  }

  deleteCategory(id: number){
      return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
    }

  updateCategory(id: number, category: any){
      return this.http.post<any>(`${this.baseUrl}/categories/${id}`, category);
    }

  getCategory(id: number): Observable<Category> {
      return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }
}//
