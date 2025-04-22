import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,

    // Servicios para obtener los datos desde API
    private productService: ProductService,
    private categoryService: CategoryService

  ) {

    // Validadores del formulario para agregar el producto
    this.productAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: [null, [
        Validators.required,
        Validators.max(100000000),
        Validators.min(1),
        Validators.pattern(/^[0-9]+$/)
      ]],
      category_id: [null],
      description: [null, [Validators.maxLength(300)]],
      image: [null, [this.validateImage]]
    });

    addIcons({ arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline });
  }

  // Para enlazar con elementos HTML
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('dropdownTrigger') dropdownTriggerRef!: ElementRef;

  // Formulario de agregar producto
  productAddForm: FormGroup;

  // Indicador de carga
  loading = false;

  // Almacena las categorías obtenidas de la API
  categories: Category[] = [];

  // Controla si mostrar el dropdown de categorías
  showDropdown = false;

  // Almacena la categoría escogida para el producto nuevo
  selectedCategory: number | null = null;
  selectedCategoryName = '';

  // Carga las categorías al entrar a la página
  ionViewWillEnter() {
    this.loadCategories();
  }

  // Carga las categorías desde la API
  loadCategories() {
    this.categories = [];
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = [...res];
      },
      error: (err) => {
        this.openErrorPopup('Error', 'No se pudieron cargar las categorías. Código: '+err);
      }
    });
  }

  // Añadir producto
  async addProduct() {

    // Verifica que el formulario sea válido
    if (this.productAddForm.invalid || this.productAddForm.value.name.trim().length === 0) {
      this.openErrorPopup('Atención', 'Ingresa datos válidos para el producto');
      return;
    }

    this.loading = true;

    // Arma un formData con los datos ingresados en el formulario
    const formValues = this.productAddForm.value;

    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('price', formValues.price);

    // Agrega los datos no requeridos si es que existen
    if (formValues.description != null) {
      formData.append('description', formValues.description);
    }

    if (this.selectedCategory != null) {
      formData.append('category_id', this.selectedCategory.toString());
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Realiza la petición POST a través del servicio
    this.productService.addProduct(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.openSuccessPopup(response.id, 'Éxito', 'El producto se añadió satisfactoriamente.');
      },
      error: (err) => {
        this.openErrorPopup('Error', 'No se pudo subir el producto. Código: ' + err);
        this.loading = false;
      }
    });
  }

  // Gestión de popups
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  // Define la acción del popup al presionar su botón único
  popupAction: () => void = () => { this.showPopup = false; }; // Por defecto solo se cierra

  // Método para abrir un popup de error
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

  // Método que recibe el id para abrir un popup que redirige al producto creado
  openSuccessPopup(
    idProduct: number | null = null,
    title: string = 'Producto creado',
    description: string = 'El producto se ha creado satisfactoriamente',
    buttonText: string = 'Aceptar'
  ) {
    this.popupTitle = title;
    this.popupDescription = description;
    this.popupButtonText = buttonText;
    this.popupAction = () => {
      this.showPopup = false;
      this.router.navigate(['/product-detail', idProduct], {
        queryParams: { shouldRefresh: true },
        replaceUrl: true
      });
    };
    this.showPopup = true;
  }

  // Acción al presionar botón del popup
  handlePopupAction() {
    this.popupAction();
  }

  // Selecciona una categoría y lo marca en el dropdown
  selectCategory(id: number | null) {
    this.selectedCategory = id;
    this.selectedCategoryName =
      this.categories.find(c => c.id === id)?.name || 'Sin categoría';
    this.showDropdown = false;
  }

  // Vuelve a productos sin crear nada
  goBack() {
    this.router.navigateByUrl('/products', { replaceUrl: true });
  }

  // Maneja la subida y previsualización de imagen escogida para el producto
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

  // Quita la imagen escogida
  removeImage(event: Event) {
    event.stopPropagation();
    this.imagePreview = null;
    this.selectedFile = null;
    this.productAddForm.get('image')?.reset();
  }

  // Valida que la imagen subida cumpla ciertas validaciones
  // Que no pese más de 10MB y que sea jpg, png o webp
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

  // Validación que no permite poner ceros a la izquierda en el precio del producto
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

  // Detecta los click fuera del dropdown y lo cierra en consecuencia
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = this.dropdownRef?.nativeElement.contains(event.target);
    const clickedInsideTrigger = this.dropdownTriggerRef?.nativeElement.contains(event.target);

    if (!clickedInsideDropdown && !clickedInsideTrigger) {
      this.showDropdown = false;
    }
  }

}
