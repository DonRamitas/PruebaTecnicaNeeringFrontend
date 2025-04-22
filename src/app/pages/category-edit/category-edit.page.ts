import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-category-edit',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './category-edit.page.html',
  styleUrls: ['./category-edit.page.scss'],

})

export class CategoryEditPage {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,

    // Utiliza el servicio categoría para editar
    private categoryService: CategoryService

  ) {

    // Validadores del formulario de edición de categoría
    this.categoryEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
    });

    addIcons({ arrowBack });
  }

  // Formulario de edición de categoría
  categoryEditForm: FormGroup;

  // Booleano que indica cuando se está cargando un recurso
  loading = false;

  // Almacena los datos de la categoría a editar
  category: Category | null = null;

  // Obtiene el id de la categoría a editar desde la pantalla anterior y la carga
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(+id);
    }
  }

  // Carga los datos de la categoría a editar
  loadCategory(id: number) {
    this.loading = true;
    this.categoryService.getCategory(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.category = response;
        this.categoryEditForm.patchValue({
          name: this.category.name,
        });
      },
      error: (err) => {
        this.openErrorPopup('Error', 'Error al cargar los datos de la categoría. Código: ', err);
        this.loading = false;
      }
    });
  }

  // Envía los datos editados al backend
  async editCategory() {

    // Detecta primero si el formulario de edición es válido
    if (this.categoryEditForm.invalid || this.categoryEditForm.value.name.trim().length === 0) {
      this.openErrorPopup('Atención', 'Ingresa un nombre válido');
      return;
    }

    this.loading = true;

    const formValues = this.categoryEditForm.value;

    // Revisa si hay diferencia entre el nombre antiguo y el actual
    if (formValues.name === this.category?.name) {
      this.openErrorPopup('Sin cambios', 'No realizaste ningún cambio.');
      this.loading = false;
      return;
    }

    // Arma un FormData con los datos necesarios para el PUT
    const formData = new FormData();

    formData.append('_method', 'PUT');

    formData.append('name', formValues.name);

    // Utiliza el servicio de categorías para hacer el PUT
    this.categoryService.updateCategory(this.category!.id, formData).subscribe({
      next: () => {
        this.loading = false;
        this.openSuccessPopup('Éxito', 'La categoría se editó satisfactoriamente.');
      },
      error: (err) => {
        this.openErrorPopup('Error', 'Error al editar categoría. Código: ' + err);
        this.loading = false;
      }
    });
  }

  // Para gestionar el popup
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  popupAction: () => void = () => { this.showPopup = false; };

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

  // Abre un popup que devuelve a la pantalla de categorías
  openSuccessPopup(
    title: string = 'Éxito',
    description: string = 'La categoría se editó satisfactoriamente',
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

  // Vuelve a la pantalla de categorías sin editar nada
  goBack() {
    this.router.navigateByUrl('/categories', { replaceUrl: true });
  }




}
