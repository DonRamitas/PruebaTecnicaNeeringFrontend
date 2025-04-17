import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  form: FormGroup;
  show = false;                     // ← Propiedad para toggle contraseña
  private apiUrl = 'http://localhost:8000/api/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private storage: Storage,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

  async login() {
    if (this.form.invalid) {
      const t = await this.toastCtrl.create({
        message: 'Completa todos los campos.',
        duration: 2000,
        color: 'warning'
      });
      t.present();
      return;
    }

    this.http.post<{ token: string }>(this.apiUrl, this.form.value).subscribe({
      next: async ({ token }) => {
        await this.storage.set('token', token);
        this.router.navigate(['/home']);
      },
      error: async () => {
        const t = await this.toastCtrl.create({
          message: 'Credenciales inválidas.',
          duration: 2000,
          color: 'danger'
        });
        t.present();
      }
    });
  }
}
