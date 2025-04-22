import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { CategoryService } from 'src/app/services/category.service';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,

    // Servicio para hacerle POST a una categoría
    private categoryService: CategoryService

  ) {

    // Validador para el nombre de la categoría
    this.categoryAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
    });

    addIcons({ arrowBack });
  }

  // Formulario para añadir categoría
  categoryAddForm: FormGroup;

  // Booleano que indica cuando se está cargando un recurso
  loading = false;

  // Agregar la categoría ingresada
  async addCategory() {

    // Verifica que el nombre ingresado para la categoría sea válido
    if (this.categoryAddForm.invalid || this.categoryAddForm.value.name.trim().length===0) {
      this.openErrorPopup('Atención', 'Ingresa un nombre válido');
      return;
    }

    this.loading = true;

    // Realiza el POST a través del servicio de cateogorías
    this.categoryService.addCategory(this.categoryAddForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.openSuccessPopup('Éxito', 'La categoría se añadió satisfactoriamente.');
      },
      error: (err) => {
        this.openErrorPopup('Error', 'Error al subir categoría. Código: ' + err);
        this.loading = false;
      }
    });
  }

  // Pará la gestión del popup
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  popupAction: () => void = () => { this.showPopup = false; }; // por defecto solo se cierra

  // Abre un popup de error
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

  // Abre un popup que redirige a las categorías cuando es creada una nueva
  openSuccessPopup(
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
        replaceUrl: true
      });
    };
    this.showPopup = true;
  }

  handlePopupAction() {
    this.popupAction();
  }

  goBack() {
    this.router.navigateByUrl('/categories', { replaceUrl: true });
  }

}
