import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DishService } from '../../../services/dish.service'; // Ton service du Canvas
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Dish {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  category: string;
  orderCount: number;
}

@Component({
  selector: 'app-dishes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dishes.html',
  styleUrls: ['./dishes.css']
})
export class DishesManagerComponent implements OnInit {
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  searchQuery: string = '';
  currentFilter: 'all' | 'active' | 'inactive' = 'all';
  selectedCategory: string = 'all';

  // Base d'URL pour pointer vers le dossier public d'images de ton serveur Node.js
  private readonly serverBaseUrl = 'http://localhost:3000/';

  allDishes: Dish[] = [];
  filteredDishes: Dish[] = [];
  top5Dishes: Dish[] = [];
  
  // Catégories figées de BamaFood
  availableCategories: string[] = ["Spécialités", "FastFood", "Accompagnements", "Principaux", "Boissons", "Jus"];

  // Compteurs
  totalDishesCount = 0;
  activeDishesCount = 0;
  inactiveDishesCount = 0;

  // ==========================================
  // ÉTATS & PROPRIÉTÉS POUR LA MODALE D'ÉDITION
  // ==========================================
  showEditModal = false;
  editForm!: FormGroup;
  selectedDishToEdit: Dish | null = null;
  modalImagePreview: string | null = null;
  modalSelectedFile: File | null = null;
  isUpdating = false;
  modalErrorMessage: string | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dishService: DishService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCatalogData();
    this.initEditForm();
  }

  // Initialisation du formulaire réactif pour la modale d'édition
  initEditForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      description: ['']
    });
  }

  // Chargement réel en direct de MySQL via Node.js
  loadCatalogData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.dishService.getManagerCatalog().subscribe({
      next: (data: Dish[]) => {
        // Reconstruction des liens d'images complets de manière propre
        this.allDishes = data.map(dish => ({
          ...dish,
          imageUrl: dish.imageUrl.startsWith('http') ? dish.imageUrl : `${this.serverBaseUrl}${dish.imageUrl}`
        }));

        this.calculateCounters();
        this.extractTop5();
        this.applyFiltersAndSearch();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de connexion MySQL :", err);
        this.errorMessage = "Impossible de charger le catalogue de plats.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateCounters(): void {
    this.totalDishesCount = this.allDishes.length;
    this.activeDishesCount = this.allDishes.filter(d => d.isActive).length;
    this.inactiveDishesCount = this.allDishes.filter(d => !d.isActive).length;
  }

  extractTop5(): void {
    this.top5Dishes = [...this.allDishes]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
  }

  // Filtrage combiné réactif : Recherche + Statut En ligne + Catégorie sélectionnée
  applyFiltersAndSearch(): void {
    this.filteredDishes = this.allDishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (this.currentFilter === 'active') {
        matchesStatus = dish.isActive;
      } else if (this.currentFilter === 'inactive') {
        matchesStatus = !dish.isActive;
      }

      const matchesCategory = this.selectedCategory === 'all' || dish.category === this.selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.applyFiltersAndSearch();
  }

  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    this.currentFilter = status;
    this.applyFiltersAndSearch();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFiltersAndSearch();
  }

  // BASCULE ET SAUVEGARDE EN BASE DE DONNÉES EN TEMPS RÉEL (SWITCH)
  toggleDishStatus(dish: Dish): void {
    const nextStatus = !dish.isActive;

    // Mise à jour optimiste de l'UI pour une réactivité instantanée
    dish.isActive = nextStatus;
    this.calculateCounters();
    this.applyFiltersAndSearch();

    // Envoi de la modification à la base de données MySQL
    this.dishService.toggleDishStatus(dish.id, nextStatus).subscribe({
      next: (response) => {
        console.log(`Statut MySQL du plat "${dish.name}" modifié avec succès !`, response.message);
      },
      error: (err) => {
        console.error("Échec de la mise à jour MySQL, annulation de la bascule :", err);
        // Rétablissement de l'état précédent en cas d'erreur réseau
        dish.isActive = !nextStatus;
        this.calculateCounters();
        this.applyFiltersAndSearch();
        this.cdr.detectChanges();
      }
    });
  }

  // =======================================================
  // LOGIQUE DE COMMANDE DU MODAL D'ÉDITION (CLIC MODIFIER)
  // =======================================================

  // 1. Ouvre la modale et injecte les valeurs du plat sélectionné
  onEditDish(dish: Dish): void {
    console.log("Ouverture de la modale d'édition pour le plat : ", dish);
    this.selectedDishToEdit = dish;
    this.modalImagePreview = dish.imageUrl;
    this.modalSelectedFile = null;
    this.modalErrorMessage = null;

    this.editForm.patchValue({
      name: dish.name,
      price: dish.price,
      category: dish.category,
      description: dish.description || ''
    });

    this.showEditModal = true;
    this.cdr.detectChanges(); // Force le rafraîchissement d'Angular pour dessiner le modal
  }

  // 2. Gestion du changement de photo d'illustration dans le modal
  onModalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.modalSelectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.modalImagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.modalSelectedFile);
    }
  }

  // 3. Envoi asynchrone des modifications à ton API Node.js / MySQL (via HTTP PUT)
  onUpdateSubmit(): void {
    if (this.editForm.invalid || !this.selectedDishToEdit) {
      this.modalErrorMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    }

    this.isUpdating = true;
    this.modalErrorMessage = null;

    // Utilisation de FormData pour permettre l'envoi d'un fichier binaire d'image
    const formData = new FormData();
    formData.append('name', this.editForm.value.name);
    formData.append('price', this.editForm.value.price.toString());
    formData.append('category', this.editForm.value.category);
    formData.append('description', this.editForm.value.description || '');

    // S'il y a un nouveau fichier d'image sélectionné
    if (this.modalSelectedFile) {
      formData.append('image', this.modalSelectedFile);
    }

    // Récupération de l'en-tête d'authentification JWT
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/api/dishes/update/${this.selectedDishToEdit.id}`, formData, { headers }).subscribe({
      next: (response: any) => {
        console.log("Plat mis à jour avec succès dans MySQL !", response);
        this.isUpdating = false;
        this.showEditModal = false; // Ferme la modale

        // Recharge l'affichage global en direct du serveur
        this.loadCatalogData();
      },
      error: (err) => {
        console.error("Erreur reçue lors de la mise à jour :", err);
        this.isUpdating = false;
        this.modalErrorMessage = err.error?.message || "Erreur de mise à jour. Veuillez réessayer.";
        this.cdr.detectChanges();
      }
    });
  }

  // Fermer la modale d'édition et vider le cache
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDishToEdit = null;
    this.modalImagePreview = null;
    this.modalSelectedFile = null;
    this.cdr.detectChanges();
  }

  backToDashboard(): void {
    this.router.navigate(['/manager/dashboard'], { replaceUrl: true });
  }

  goToAddDishPage(): void {
    this.router.navigate(['/manager/dishes/add']);
  }
}