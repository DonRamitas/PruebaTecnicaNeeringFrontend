import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { LoadingOverlayComponent } from 'src/app/components/loading-overlay/loading-overlay.component';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category.model';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PopupComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss'],

})
export class ProductEditPage implements OnInit {

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,

    // Servicios utilizados para comunicarse con la API
    private productService: ProductService,
    private categoryService: CategoryService

  ) {

    // Validadores del formulario de edición de producto
    this.productEditForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      price: [null, [
        Validators.required,
        Validators.max(100000000),
        Validators.min(1)
      ]],
      category_id: [null],
      description: [null, [Validators.maxLength(300)]],
      image: [null, [this.validateImage]]
    });

    addIcons({ arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline });
  }

  // Para enlazar con elementos del HTML
  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('dropdownTrigger') dropdownTriggerRef!: ElementRef;

  // Formulario de edición de producto
  productEditForm: FormGroup;

  // Booleano que indica si se está cargando algún recurso
  loading = false;

  // Url del storage de la API
  storagePrefix = 'http://localhost:8000/storage/'; // o donde tengas tus imágenes

  // Recibe el ID del producto a editar
  productId: number = 0;

  // Almacena los datos del producto a editar
  product: Product | null = null;

  // Indica si se cambió la imagen del producto en la edición
  changedImage: Boolean = false;

  // Almacena las categorías obtenidas de la API
  categories: Category[] = [];

  // Indica si se está mostrando el dropdown
  showDropdown = false;

  // Almacena la categoría seleccionada para el producto editado
  selectedCategory: number | null = null;
  selectedCategoryName = '';

  // Booleano que indica si se cambió la categoría del producto
  changedCategory: Boolean = false;

  // Al iniciar carga las categorías y recibe el id del producto
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.productId = +id;
    }
  }

  // Se utiliza el storage para trabajar con imagenes
  async ionViewDidEnter() {
    await this.storage.create();
  }

  // Carga las categorías al entrar a la página
  ionViewWillEnter() {
    this.loadCategories();
  }

  // Carga los datos del producto en el formulario de edición
  loadProduct(id: number) {
    this.changedCategory = false;
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (response) => {
        this.loading = false;
        this.product = response;
        this.changedImage = false;
        this.productEditForm.patchValue({
          name: this.product.name,
          price: this.product.price,
          description: this.product.description,
        });
        this.selectedCategory = this.product.category ? this.product.category.id : null;
        this.selectedCategoryName = this.product.category ? this.product.category.name : 'Sin categoría';
        this.imagePreview = response.image
          ? `${this.storagePrefix}${response.image}`
          : null;
      },
      error: (err) => {
        this.openErrorPopup('Error', 'No se pudieron cargar los datos del producto. Código: ' + err);
        this.loading = false;
      }
    });
  }

  // Método que valida y aplica la modificación del producto
  async editProduct() {

    // Si el formulario es inválido, mostrar error
    if (this.productEditForm.invalid) {
      this.openErrorPopup('Atención', 'Formulario inválido');
      return;
    }

    this.loading = true;

    // Toma los valores del formulario y los verifica cuales cambiaron de valor
    const formValues = this.productEditForm.value;
    const updatedFields: any = {};

    // Comparar campos modificados
    if (formValues.name !== this.product?.name) {
      updatedFields.name = formValues.name;
    }

    if (+formValues.price !== +this.product!.price) {
      updatedFields.price = formValues.price;
    }

    if (formValues.description !== this.product?.description) {
      updatedFields.description = formValues.description ?? '';
    }

    if (this.changedCategory) {
      updatedFields.category_id = this.selectedCategory;
    }

    // Si no hay cambios, mostrar popup
    if (Object.keys(updatedFields).length === 0 && !this.changedImage) {
      this.openErrorPopup('Sin cambios', 'No realizaste ningún cambio en el producto.');
      this.loading = false;
      return;
    }

    // Si pasa las validaciones, construir un FormData con los datos a actualizar
    const formData = new FormData();

    formData.append('_method', 'PUT');

    const nullableFields = ['category_id', 'description'];

    for (const key in updatedFields) {
      const value = updatedFields[key];

      // Permite actualizar datos a null si el usuario así lo quiso
      if (nullableFields.includes(key)) {
        formData.append(key, value === null ? '' : value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }

    // Cambia o quita la imagen
    if (this.changedImage) {
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      } else {
        formData.append('remove_image', 'true');
      }
    }

    // Envía el formdata como un PUT al servicio de producto
    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.openSuccessPopup(response.id, 'Éxito', 'El producto se editó satisfactoriamente.');
      },
      error: (err) => {
        this.openErrorPopup('Error', 'No se pudo editar el producto. Código: ' + err);
        this.loading = false;
      }
    });
  }

  // Gestiona el popup
  showPopup = false;
  popupTitle = '';
  popupDescription = '';
  popupButtonText = '';

  // Define la acción del popup al presionar su botón
  popupAction: () => void = () => { this.showPopup = false; }; // Por defecto se cierra

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

  // Método para abrir un popup que redirige al detalle del producto editado
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
      this.router.navigate(['/product-detail', idProduct], {
        queryParams: { shouldRefresh: true },
        replaceUrl: true // Reemplaza el historial para no volver a add
      });
    };
    this.showPopup = true;
  }

  // Acción al presionar botón del popup
  handlePopupAction() {
    this.popupAction();
  }

  // Vuelve al detalle del producto sin editar nada
  goBack() {
    this.router.navigateByUrl('/product-detail/' + this.productId, { replaceUrl: true });
  }

  // Carga las categorías desde la API
  loadCategories() {
    this.categoryService.getAllCategories().subscribe((res) => {
      this.categories = [...res];
    });
  }

  // Selecciona una categoría y la marca en el dropdown
  selectCategory(id: number | null) {
    this.changedCategory = true;
    this.selectedCategory = id;
    this.selectedCategoryName =
      this.categories.find(c => c.id === id)?.name || 'Sin categoría';
    this.showDropdown = false;

  }

  // Escucha las pulsaciones fuera del dropdown y lo cierra en consecuencia
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = this.dropdownRef?.nativeElement.contains(event.target);
    const clickedInsideTrigger = this.dropdownTriggerRef?.nativeElement.contains(event.target);

    if (!clickedInsideDropdown && !clickedInsideTrigger) {
      this.showDropdown = false;
    }
  }

  // Almacenan el preview e imagen elegida para el producto editado
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  // Selecciona una imagen para el producto editado
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
      this.productEditForm.get('image')?.setValue(file);

      this.changedImage = true;

      // Generar preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Quita la imagen del producto
  removeImage(event: Event) {
    event.stopPropagation(); // evita que se dispare el click del contenedor
    this.imagePreview = null;
    this.selectedFile = null;
    this.changedImage = true;
    this.productEditForm.get('image')?.reset();
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
      this.productEditForm.get('price')?.setValue(input.value);
    }
  }

}
