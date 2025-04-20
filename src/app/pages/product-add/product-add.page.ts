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
      description: ['', [Validators.maxLength(300)]],
      image: [null, [this.validateImage]]
    });

    addIcons({ arrowBack, cloudUploadOutline, chevronDownOutline });
  }

  async ionViewDidEnter() {
    await this.storage.create();
  }

  async addProduct() {
    if (this.productAddForm.invalid) {
      this.openPopup('Atención', 'Error al añadir producto');
      return;
    }

    this.loading = true;

    console.log(this.productAddForm.value);

    this.productService.addProduct(this.productAddForm.value).subscribe({
      next: () => {
          this.loading = false
          console.log('subidox');
          //this.router.navigateByUrl('/products', { replaceUrl: true })
      },
      error: () => {
        this.openPopup('Atención', 'Credenciales inválidas'),
        console.log('subidox');
          this.loading = false
      }
    });

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
    this.productAddForm.patchValue({
      category_id: id
    });
    console.log(this.productAddForm.get('category_id'));
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

}
