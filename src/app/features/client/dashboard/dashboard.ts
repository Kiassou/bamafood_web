import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardClientComponent implements OnInit {

  stats = {
    ordersCount: 0,
    enAttenteCount: 0,
    deliveryCount: 0,
    favoritesCount: 0
  };

  isLoading = true; 
  isSidebarClosed = false;
  isSidebarOpen = false;
  username = '';
  cartCount = 0;
  notificationCount = 0;
  showLogoutModal = false;
  showProfileModal = false;
  showProfileUpdateModal = false;
  isSubmittingProfile = false;
  successMessage = '';
  showPasswordFields = false;
  showHolyDishesModal = false;
  showActivityModal = false;

  currentUser: any = null;

  profileUpdate = {
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Client';
    this.loadCurrentUser();
    this.loadNotificationCount();
    this.loadDashboardStats();
    this.updateCartDisplay();
  }

  loadNotificationCount(): void {
  this.userService.getNotificationCount().subscribe({
    next: (data: any) => {
      this.notificationCount = data.count || 0;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erreur notification count', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  loadDashboardStats(): void {
  this.userService.getDashboardStats().subscribe({
    next: (data: any) => {
      this.stats = {
        ordersCount: data.ordersCount || 0,
        deliveryCount: data.deliveryCount || 0,
        enAttenteCount: data.enAttenteCount || 0,
        favoritesCount: data.favoritesCount || 0
      };

      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Erreur stats dashboard', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  updateCartDisplay(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
    this.cartCount = this.cartService.getCart().length;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 992) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth > 992) {
      this.isSidebarClosed = !this.isSidebarClosed;
    } else {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  loadCurrentUser(): void {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.currentUser = {
          id: data.id,
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || '',
          createdAt: data.created_at || data.createdAt || null
        };

        this.profileUpdate = {
          first_name: this.currentUser.first_name,
          last_name: this.currentUser.last_name,
          username: this.currentUser.username,
          email: this.currentUser.email,
          phone: this.currentUser.phone,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur profil', err);
        this.isLoading = false;
      }
    });
  }

  openHolyDishesModal(): void {
    this.showHolyDishesModal = true;
  }

  closeHolyDishesModal(): void {
    this.showHolyDishesModal = false;
  }

  openActivityModal(): void {
    this.showActivityModal = true;
  }

  closeActivityModal(): void {
    this.showActivityModal = false;
  }

  openProfileModal(): void {
    this.loadCurrentUser();
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  openProfileUpdate(): void {
    this.showProfileModal = false;
    this.showProfileUpdateModal = true;
  }

  closeProfileUpdateModal(): void {
    this.showProfileUpdateModal = false;
  }

  togglePasswordFields(): void {
  this.showPasswordFields = !this.showPasswordFields;

  if (!this.showPasswordFields) {
    this.profileUpdate.oldPassword = '';
    this.profileUpdate.newPassword = '';
    this.profileUpdate.confirmPassword = '';
  }
}

  confirmProfileUpdate(): void {
  if (this.isSubmittingProfile) return;
  if (!this.currentUser?.id) return;

  this.isSubmittingProfile = true;
  this.successMessage = '';

  this.isLoading = true;

  const profilePayload = {
    first_name: this.profileUpdate.first_name,
    last_name: this.profileUpdate.last_name,
    email: this.profileUpdate.email,
    phone: this.profileUpdate.phone
  };

  this.userService.updateProfile(profilePayload).subscribe({
    next: () => {
      const wantsPasswordChange =
        this.profileUpdate.oldPassword &&
        this.profileUpdate.newPassword &&
        this.profileUpdate.confirmPassword;

      if (wantsPasswordChange) {
        if (this.profileUpdate.newPassword !== this.profileUpdate.confirmPassword) {
          this.isSubmittingProfile = false;
          console.error('Les nouveaux mots de passe ne correspondent pas');
          return;
        }

        this.userService.changePassword({
          currentPassword: this.profileUpdate.oldPassword,
          newPassword: this.profileUpdate.newPassword
        }).subscribe({
          next: () => {
            this.successMessage = 'Profil mis à jour avec succès.';
            this.isSubmittingProfile = false;
            this.showProfileUpdateModal = false;
            this.loadCurrentUser();
          },
          error: (err) => {
            this.isSubmittingProfile = false;
            console.error('Erreur changement mot de passe', err);
          }
        });
      } else {
        this.successMessage = 'Profil mis à jour avec succès.';
        this.isSubmittingProfile = false;
        this.showProfileUpdateModal = false;
        this.loadCurrentUser();
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      this.isSubmittingProfile = false;
      console.error('Erreur update profil', err);
    }
  });
}
}