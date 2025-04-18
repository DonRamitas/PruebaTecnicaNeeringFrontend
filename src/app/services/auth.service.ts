import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, of } from 'rxjs';
import { tap, catchError, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // reemplaza por tu IP o localhost:8000

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
    );
  }

  logout(): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    }).pipe(
      tap(() => {
        // Si el logout fue exitoso, eliminamos el token
        localStorage.removeItem('jwt');
      }),
      mapTo(true), // Retornar true si todo salió bien
      catchError(() => of(false)) // Retornar false si hubo error
    );
  }
}
