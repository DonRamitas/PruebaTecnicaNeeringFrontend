import { Component, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './product-add.page.html',
  styleUrls: ['./product-add.page.scss'],

})
export class ProductAddPage {

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('dropdownTrigger') dropdownTriggerRef!: ElementRef;

  productAddForm: FormGroup;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private toastCtrl: ToastController,
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService

  ) {
    this.productAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: [null, [
        Validators.required,
        Validators.max(100000000),
        Validators.min(1)
      ]],
      category_id: [null], // se asume que 'null' es "sin categoría"
      description: [null, [Validators.maxLength(300)]],
      image: [null, [this.validateImage]]
    });

    addIcons({ arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline });
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

  async addProduct() {
    if (this.productAddForm.invalid) {
      this.openErrorPopup('Atención', 'Formulario inválido');
      return;
    }
  
    this.loading = true;
  
    const formValues = this.productAddForm.value;
  
    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('price', formValues.price);

    if(formValues.description!=null){
      formData.append('description', formValues.description);
    }
    

    if(this.selectedCategory!=null){
      formData.append('category_id', this.selectedCategory.toString() );
    }
  
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
  
    this.productService.addProduct(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.openSuccessPopup(response.id,'Éxito', 'El producto se añadió satisfactoriamente.');
      },
      error: () => {
        this.openErrorPopup('Error', 'Error al subir producto');
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
    buttonText: string = 'OK'
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
    buttonText: string = 'OK'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupAction = () => {
      this.showPopup = false;
      this.router.navigate(['/product-detail', idProduct], {
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

  validateImage(control: AbstractControl): { [key: string]: any } | null {
    const file = control.value;
    if (!file) return null;
  
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { maxSize: true };
    }
  
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { invalidType: true };
    }
  
    return null;
  }

  goBack(){
    this.router.navigateByUrl('/products', {replaceUrl: true});
  }

  ngOnInit() {
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.loadCategories();
  }

  categories: Category[] = [];

  loadCategories() {
    this.categoryService.getAllCategories().subscribe((res) => {
      this.categories = [...res];
    });
  }

  preventLeadingZero(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    
    // Si el campo está vacío y se presiona 0, bloquear
    if (input.value.length === 0 && event.key === '0') {
      event.preventDefault();
    }
  }
  
  cleanLeadingZeros(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
  
    // Si se pegaron ceros tipo "0005", limpiarlos
    if (/^0\d+/.test(value)) {
      input.value = value.replace(/^0+/, '');
      this.productAddForm.get('price')?.setValue(input.value);
    }
  }

  showDropdown = false;
  selectedCategory: number | null = null;
  selectedCategoryName = '';

  selectCategory(id: number | null) {
    this.selectedCategory = id;
    this.selectedCategoryName =
      this.categories.find(c => c.id === id)?.name || 'Sin categoría';
    this.showDropdown = false;
    
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = this.dropdownRef?.nativeElement.contains(event.target);
    const clickedInsideTrigger = this.dropdownTriggerRef?.nativeElement.contains(event.target);

    if (!clickedInsideDropdown && !clickedInsideTrigger) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectedFile: File | null = null;

  imagePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validaciones
      if (file.size > 10 * 1024 * 1024) {
        this.openErrorPopup('Atención', 'La imagen no puede pesar más de 10MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.openErrorPopup('Atención', 'Formato de imagen inválido.\nSolo JPG, PNG o WEBP.');
        return;
      }

      this.selectedFile = file;
      this.productAddForm.get('image')?.setValue(file);

      // Generar preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation(); // evita que se dispare el click del contenedor
    this.imagePreview = null;
    this.selectedFile=null;
    this.productAddForm.get('image')?.reset();
  }

}
