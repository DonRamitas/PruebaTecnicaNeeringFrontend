import { Component, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router, ActivatedRoute } from '@angular/router';
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

  categoryEditForm: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService

  ) {
    this.categoryEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
    });

    addIcons({ arrowBack });
  }

  ngOnInit() {
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCategory(+id);
    }
  }

  category: Category | null = null;

  loadCategory(id:number){
    this.loading = true;
    this.categoryService.getCategory(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.category = response;
        console.log('loaded category');
        this.categoryEditForm.patchValue({
          name: this.category.name,
        });
      },
      error: () => {
        this.openErrorPopup('Error', 'Error al cargar categoría');
        this.loading = false;
      }
    });
  }

  async editCategory() {
    if (this.categoryEditForm.invalid) {
      this.openErrorPopup('Atención', 'Formulario inválido');
      return;
    }
  
    this.loading = true;
  
    const formValues = this.categoryEditForm.value;
  
    // Comparar campos modificados
    if (formValues.name === this.category?.name) {
      this.openErrorPopup('Sin cambios', 'No realizaste ningún cambio.');
      this.loading = false;
      return;
    }
  
    const formData = new FormData();

    formData.append('_method','PUT');

    formData.append('name', formValues.name);

    // Enviar al backend
    this.categoryService.updateCategory(this.category!.id, formData).subscribe({
      next: (response) => {
        console.log(response);
        this.loading = false;
        this.openSuccessPopup(response.id, 'Éxito', 'La categoría se editó satisfactoriamente.');
      },
      error: (err) => {
        console.error('Error en update:', err);
        this.openErrorPopup('Error', 'Error al editar categoría');
        this.loading = false;
      }
    });
  }

  //TODO: poner en ionview enter lo de load category

  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';
  popupHeaderColor = '';

  // Define el tipo de acción que quieres ejecutar
  popupAction: () => void = () => { this.showPopup = false; }; // por defecto solo se cierra

  // Método para abrir un popup simple
  openErrorPopup(
    title: string = 'Atención',
    description: string = 'Algo pasó',
    buttonText: string = 'OK',
    headerColor: string = 'bg-fuchsia-800'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupHeaderColor = headerColor;
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
    buttonText: string = 'OK',
    headerColor: string = 'bg-fuchsia-800'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupHeaderColor = headerColor;
    this.popupAction = () => {
      this.showPopup = false;
      this.router.navigate(['/categories'], {
        queryParams: { fromAddCategory: true },
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
