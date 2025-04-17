import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IonicModule,
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  form: FormGroup; // <- Antes era registerForm
  private apiUrl = 'http://localhost:8000/api/register';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private storage: Storage,
    private toastController: ToastController,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

  async register() {
    if (this.form.invalid) {
      this.presentToast('Por favor completa todos los campos correctamente.');
      return;
    }

    const formData = this.form.value;

    this.http.post(this.apiUrl, formData).subscribe({
      next: async (response: any) => {
        await this.storage.set('token', response.token);
        this.presentToast('Registro exitoso');
        this.router.navigate(['/']);
      },
      error: (error) => {
        const msg = error.error?.message || 'Ocurrió un error al registrar.';
        this.presentToast(msg);
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }
}
