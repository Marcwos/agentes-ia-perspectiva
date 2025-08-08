import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html'
})
export class Banner {
  isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getCurrentUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'usuario@ejemplo.com';
  }

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: (response: any) => {
        console.log('✅ Logout completado:', response);
        
        // Redireccionar al login
        this.router.navigate(['/login']).then(() => {
          console.log('🏠 Redirigido a login');
        }).catch(() => {
          // Si falla la redirección, recargar la página
          window.location.href = '/login';
        });
      },
      error: (error: any) => {
        console.error('❌ Error en logout:', error);
        
        // Incluso si hay error, redirigir (porque la sesión local se limpió)
        this.router.navigate(['/login']).catch(() => {
          window.location.href = '/login';
        });
      },
      complete: () => {
        this.isLoggingOut = false;
      }
    });
  }
}
