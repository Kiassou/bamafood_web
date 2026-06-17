import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Ajout de ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DishService } from '../../../services/dish.service'; 

interface CreatedDishDisplay {
  name: string;
  price: number;
  category: string;
  description: string;
}

@Component({
  selector: 'app-add-dish',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-dish.html',
  styleUrls: ['./add-dish.css']
})
export class AddDishComponent implements OnInit {
  dishForm!: FormGroup;
  submitted = false;
  isSaving = false;
  errorMessage: string | null = null;

  imagePreview: string | null = null;
  selectedFile: File | null = null;
  
  showSuccessModal = false;
  createdDish: CreatedDishDisplay | null = null;

  categories = ["Spécialités", "FastFood", "Accompagnements", "Principaux", "Boissons", "Jus"];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dishService: DishService,
    private cdr: ChangeDetectorRef // <-- Injection ici
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.dishForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      description: [''],
      isActive: [true]
    });
  }

  get f() { return this.dishForm.controls; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges(); // Force l'aperçu d'image
      };
      reader.readAsDataURL(this.selectedFile);
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.dishForm.invalid || !this.selectedFile) {
      if (!this.selectedFile) {
        this.errorMessage = "Une image est obligatoire pour illustrer le plat.";
      }
      return;
    }

    this.isSaving = true;

    const formData = new FormData();
    formData.append('name', this.dishForm.value.name);
    formData.append('price', this.dishForm.value.price.toString());
    formData.append('category', this.dishForm.value.category);
    formData.append('description', this.dishForm.value.description || '');
    formData.append('isActive', this.dishForm.value.isActive.toString());
    formData.append('image', this.selectedFile);

    this.dishService.createDish(formData).subscribe({
      next: (response: any) => {
        console.log("Plat créé avec succès dans MySQL ! Réponse brute :", response);
        this.isSaving = false;

        const targetDish = response && response.dish ? response.dish : response;

        this.createdDish = {
          name: targetDish?.name || this.dishForm.value.name,
          price: targetDish?.price || this.dishForm.value.price,
          category: targetDish?.category || this.dishForm.value.category,
          description: targetDish?.description || this.dishForm.value.description
        };

        // Déclenchement garanti de la modale de succès
        this.showSuccessModal = true;
        
        // On force Angular à actualiser le HTML immédiatement
        this.cdr.detectChanges();
        console.log("État de la modale forcé à true.");
      },
      error: (err) => {
        console.error("Erreur reçue de l'API Node.js :", err);
        this.isSaving = false;
        this.errorMessage = err.error?.message || "Une erreur est survenue lors de la création du plat.";
        this.cdr.detectChanges();
      }
    });
  }

  resetFormAndStay(): void {
    this.dishForm.reset({
      name: '',
      price: '',
      category: '',
      description: '',
      isActive: true
    });
    this.submitted = false;
    this.imagePreview = null;
    this.selectedFile = null;
    this.showSuccessModal = false;
    this.createdDish = null;
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  goToMenu(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/manager/dishes'], { replaceUrl: true });
  }

  onReturnToList(): void {
    this.router.navigate(['/manager/dishes'], { replaceUrl: true });
  }
}