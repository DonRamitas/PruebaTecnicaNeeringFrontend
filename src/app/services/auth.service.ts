import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = 'http://TU_IP_O_LOCALHOST/api'; // reemplaza por tu IP o localhost:8000

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router
  ) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  login(credentials: any) {
    return this.http.post(`${this.api}/login`, credentials);
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  async saveToken(token: string) {
    await this.storage.set('token', token);
  }

  async getToken() {
    return await this.storage.get('token');
  }

  async logout() {
    await this.storage.remove('token');
    this.router.navigate(['/login']);
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
