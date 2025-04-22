import { Component, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { IonicModule, ToastController, Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBack, cloudUploadOutline, chevronDownOutline, closeCircleOutline } from 'ionicons/icons';
import { PopupComponent } from 'src/app/components/popup/popup.component';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthService } from 'src/app/services/auth.service';
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

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('dropdownTrigger') dropdownTriggerRef!: ElementRef;

  productEditForm: FormGroup;

  loading = false;

  storagePrefix = 'http://localhost:8000/storage/'; // o donde tengas tus imágenes

  constructor(
    private fb: FormBuilder,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService

  ) {
    this.productEditForm = this.fb.group({
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

  productId:number = 0;
  product:Product | null = null;
  changedImage:Boolean = false;

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
      this.productId = +id;
    }
  }

  loadProduct(id:number){
    this.changedCategory=false;
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
  ? `http://localhost:8000/storage/${response.image}` // ajusta según tu backend
  : null;
      },
      error: () => {
        this.openErrorPopup('Error', 'Error al subir producto');
        this.loading = false;
      }
    });
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

  async editProduct() {
    if (this.productEditForm.invalid) {
      this.openErrorPopup('Atención', 'Formulario inválido');
      return;
    }
  
    this.loading = true;
  
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

    if (this.changedImage) {
      updatedFields.image = this.selectedFile;
    }
    
  
    // Si no hay cambios, mostrar popup
    if (Object.keys(updatedFields).length === 0 && !this.selectedFile) {
      this.openErrorPopup('Sin cambios', 'No realizaste ningún cambio.');
      this.loading = false;
      return;
    }
  
    const formData = new FormData();

    formData.append('_method','PUT');
  
    const nullableFields = ['category_id', 'description'];

    for (const key in updatedFields) {
      const value = updatedFields[key];

      // Si es uno de los campos que pueden ser null, permite string vacío
      if (nullableFields.includes(key)) {
        formData.append(key, value === null ? '' : value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }

    if(this.changedImage){
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }else{
        formData.append('remove_image', 'true'); // <- clave para decirle al backend "elimínala"
      }
    }

    // Enviar al backend
    this.productService.updateProduct(this.productId, formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.openSuccessPopup(response.id, 'Éxito', 'El producto se editó satisfactoriamente.');
      },
      error: (err) => {
        console.error('Error en update:', err);
        this.openErrorPopup('Error', 'Error al editar producto');
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
    this.router.navigateByUrl('/product-detail/'+this.productId, {replaceUrl: true});
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
      this.productEditForm.get('price')?.setValue(input.value);
    }
  }

  showDropdown = false;
  selectedCategory: number | null = null;
  selectedCategoryName = '';
  changedCategory:Boolean = false;

  selectCategory(id: number | null) {
    this.changedCategory = true;
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

  removeImage(event: Event) {
    event.stopPropagation(); // evita que se dispare el click del contenedor
    this.imagePreview = null;
    this.selectedFile=null;
    this.changedImage = true;
    this.productEditForm.get('image')?.reset();
  }


}
