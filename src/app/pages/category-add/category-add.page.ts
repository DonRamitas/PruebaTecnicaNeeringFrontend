import { Component, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, chevronDownOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-category-add',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './category-add.page.html',
  styleUrls: ['./category-add.page.scss'],

})
export class CategoryAddPage {

  categoryAddForm: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService

  ) {
    this.categoryAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
    });

    addIcons({ arrowBack });
  }
  async addCategory() {
    if (this.categoryAddForm.invalid) {
      this.openErrorPopup('Atención', 'Formulario inválido');
      return;
    }
  
    this.loading = true;

    this.categoryService.addCategory(this.categoryAddForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.openSuccessPopup(response.id,'Éxito', 'La categoría se añadió satisfactoriamente.');
      },
      error: () => {
        this.openErrorPopup('Error', 'Error al subir categoría');
        this.loading = false;
      }
    });
  }

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  // Define el tipo de acción que quieres ejecutar
  popupAction: () => void = () => { this.showPopup = false; }; // por defecto solo se cierra

  // Método para abrir un popup simple
  openErrorPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'Aceptar'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupAction = () => {
      this.showPopup = false;
    };
    this.showPopup = true;
  }

  // Método para abrir un popup que redirige
  openSuccessPopup(
    idProduct: number | null = null,
    title: string = 'Atención',
    description: string = 'Serás redirigido',
    buttonText: string = 'Aceptar'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupAction = () => {
      this.showPopup = false;
      this.router.navigate(['/categories'], {
        queryParams: { shouldRefresh: true },
        replaceUrl: true // Reemplaza el historial para no volver a add
      });
    };
    this.showPopup = true;
  }

// Acción al presionar botón del popup
handlePopupAction() {
  this.popupAction(); // Ejecuta lo que hayas definido
}

  goBack(){
    this.router.navigateByUrl('/categories', {replaceUrl: true});
  }

  


}
