import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, eyeOff, eye } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { App as CapacitorApp } from '@capacitor/app';
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
export class LoginPage implements OnInit, OnDestroy {
  isRegister = false;

  loginForm: FormGroup;
  registerForm: FormGroup;

  backButtonSub: any;
  lastBackPress = 0;
  timePeriodToExit = 2000;

  showPasswordLogin = false;
  showPasswordRegister = false;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private toastCtrl: ToastController,
    private router: Router,
    private platform: Platform,
    private authService: AuthService

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/),Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)]],
      birthdate: ['', [Validators.required, this.birthdateValidator]],
      countryCode: ['+56', Validators.required],
      prefix: ['+56', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]]
    });

    addIcons({ arrowBack, eyeOff, eye });
  }

  ngOnInit() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, async () => {
      if (this.isRegister) {
        this.isRegister = false;
      } else {
        const now = new Date().getTime();
        if (now - this.lastBackPress < this.timePeriodToExit) {
          await CapacitorApp.exitApp();
        } else {
          this.lastBackPress = now;
          const toast = await this.toastCtrl.create({
            message: 'Presiona nuevamente para salir',
            duration: 1500,
            position: 'bottom',
          });
          await toast.present();
        }
      }
    });
  }

  ngOnDestroy() {
    this.backButtonSub.unsubscribe();
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

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

  async login() {
    if (this.loginForm.invalid) {
      this.openPopup('Atención', 'Ingresa tus credenciales para acceder');
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
          this.loading = false
          this.router.navigateByUrl('/products', { replaceUrl: true })
      },
      error: () => {
        this.openPopup('Atención', 'Credenciales inválidas'),
          this.loading = false
      }
    });

  }

  async register() {
    if (this.registerForm.invalid) {
      this.openPopup('Atención', 'Completa correctamente todos los campos');
      return;
    }

    this.loading = true;

    const { name, email, birthdate, prefix, phone, password } = this.registerForm.value;
    const fullPhone = `${prefix}${phone}`;

    const body = {
      name,
      email,
      birthdate,
      phone: fullPhone,
      password
    };

    this.authService.register(body).subscribe({
      next: () => {
        
          this.loading = false,
          this.router.navigateByUrl('/products', { replaceUrl: true })
      },
      error: () => {
        this.openPopup('Atención', 'Bad'),
          this.loading = false
      }
    });
  }

  setRegisterOn() {
    this.isRegister = true;
  }

  setRegisterOff() {
    this.isRegister = false;
  }

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';
  popupHeaderColor = '';

  openPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'OK',
    headerColor: string = 'bg-fuchsia-800'
  ) {
    // Oculta primero por si ya estaba visible
    this.showPopup = false;

    // Usa un pequeño timeout para esperar al siguiente ciclo de render
    setTimeout(() => {
      this.popupTitle = title;
      this.popupDescription = description;
      this.popupButtonText = buttonText;
      this.popupHeaderColor = headerColor;
      this.showPopup = true;
    }, 0);
  }

  handlePopupAction(){
    this.showPopup = false;
  }

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
