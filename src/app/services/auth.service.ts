import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, mapTo } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';

// Servicio que gestiona la autenticación del usuario

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  // Realiza la solicitud POST para logearse, si funciona almacena el token JWT
  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
    );
  }

  // Realiza la solicitud POST para registrarse, si funciona almacena el token JWT
  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
    );
  }

  // Realiza la solicitud POST para cerrar sesión, si funciona elimina el token JWT actual
  logout(): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}, {

    }).pipe(
      tap(() => {
        // Si el logout fue exitoso, eliminamos el token
        localStorage.removeItem('jwt');
      }),
      mapTo(true), // Retornar true si todo salió bien
      catchError(() => of(false)) // Retornar false si hubo error
    );
  }

  // Retorna el usuario logeado actualmente
  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
