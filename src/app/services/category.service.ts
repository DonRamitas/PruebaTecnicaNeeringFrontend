import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// Servicio para comunicarse con la API y gestionar las categorías
export class CategoryService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Busca entre las categorías según un término de búsqueda y devuelve una lista de categorías resultado
  searchCategories(page: number, search: string): Observable<{ data: Category[], next_page_url: string | null }> {
    let params = new HttpParams().set('page', page);

    if (search) params = params.set('search', search);

    return this.http.get<{ data: Category[], next_page_url: string | null }>(`${this.baseUrl}/categories`, { params });
  }

  // Obtiene todas las categorías
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/all`);
  }

  // Añade una categoría
  addCategory(category: any) {
    return this.http.post<any>(`${this.baseUrl}/categories`, category);
  }

  // Elimina una categoría
  deleteCategory(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
  }

  // Actualiza los datos de una categoría
  updateCategory(id: number, category: any) {
    return this.http.post<any>(`${this.baseUrl}/categories/${id}`, category);
  }

  // Obtiene una categoría en específico
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }
}//
