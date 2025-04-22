import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, eyeOff, eye } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],

})
export class LoginPage {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService

  ) {

    // Validadores para el formulario de inicio de sesión
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // Validadores para el formulario de registro
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
      birthdate: ['', [Validators.required, this.birthdateValidator]],
      countryCode: ['+56', Validators.required],
      prefix: ['+56', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]]
    });

    addIcons({ arrowBack, eyeOff, eye });
  }

  // Booleano que indica si es registro o login
  isRegister = false;

  // Formularios de inicio de sesión y registro
  loginForm: FormGroup;
  registerForm: FormGroup;

  // Booleanos que indican si las contraseñas de los formularios se muestran
  showPasswordLogin = false;
  showPasswordRegister = false;

  // Bool que indica si se está cargando algo
  loading = false;

  // Setea los códigos de area a Chile, el mejor país de Chile
  ionViewWillEnter() {
    this.registerForm.reset({
      prefix: '+56',
      countryCode: '+56'
    });
    this.loginForm.reset({
      prefix: '+56',
      countryCode: '+56'
    });
  }

  // Función para iniciar sesión
  async login() {

    // Verifica si el formulario es válido
    // (Aunque esto no puede pasar porque el botón de submit se habilita solo cuando invalid es false)
    if (this.loginForm.invalid) {
      this.openPopup('Atención', 'Ocurrió un error imposible');
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false
        this.router.navigateByUrl('/products', { replaceUrl: true })
      },
      error: (err) => {
        this.openPopup('Error al iniciar sesión', 'Revisa los datos ingresados e inténtalo de nuevo. Código: ' + err),
          this.loading = false
      }
    });

  }

  // Función para registrarse
  async register() {

    // Verifica la validez del formulario
    if (this.registerForm.invalid) {
      this.openPopup('Atención', 'Completa correctamente todos los campos');
      return;
    }

    this.loading = true;

    // Arma la solicitud HTTP POST con los datos del usuario
    const { name, email, birthdate, prefix, phone, password } = this.registerForm.value;
    const fullPhone = `${prefix}${phone}`;

    const body = {
      name,
      email,
      birthdate,
      phone: fullPhone,
      password
    };

    // Hace la solicitud POST
    this.authService.register(body).subscribe({
      next: () => {
        this.loading = false,
          // Si funcionó el POST, ir a la pantalla principal
          this.router.navigateByUrl('/products', { replaceUrl: true })
      },
      error: (err) => {
        this.openPopup('Error de registro', 'Revisa los datos ingresados e inténtalo de nuevo. Código: ' + err),
          this.loading = false
      }
    });
  }

  // Parámetros para gestionar el popup simple
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  openPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'Aceptar'
  ) {
    this.showPopup = false;

    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.popupButtonText = buttonText;
      this.showPopup = true;
    }, 0);
  }

  // La función del botón del popup es cerrarlo
  handlePopupAction() {
    this.showPopup = false;
  }

  // Validador de la fecha de nacimiento del usuario
  birthdateValidator(control: AbstractControl): ValidationErrors | null {
    const inputDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - inputDate.getFullYear();

    const isFuture = inputDate > today;
    const isTooOld = age > 122;

    if (isFuture || isTooOld) {
      return { invalidDate: true };
    }

    return null;
  }

}
