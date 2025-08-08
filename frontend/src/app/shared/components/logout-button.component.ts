import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="logout-btn"
      (click)="logout()"
      [disabled]="isLoggingOut"
      [class.loading]="isLoggingOut">
      
      <span *ngIf="!isLoggingOut" class="logout-text">
        🚪 Cerrar Sesión
      </span>
      
      <span *ngIf="isLoggingOut" class="logout-loading">
        ⏳ Cerrando...
      </span>
    </button>
  `,
  styles: [`
    .logout-btn {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logout-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #c0392b, #a93226);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .logout-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .logout-btn.loading {
      background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    }

    .logout-text,
    .logout-loading {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .logout-loading {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class LogoutButtonComponent {
  isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: (response) => {
        console.log('✅ Logout completado:', response);
        
        // Redireccionar al login o página principal
        this.router.navigate(['/login']).then(() => {
          // Opcional: mostrar mensaje de éxito
          console.log('🏠 Redirigido a login');
        }).catch(() => {
          // Si falla la redirección, recargar la página
          window.location.href = '/login';
        });
      },
      error: (error) => {
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
