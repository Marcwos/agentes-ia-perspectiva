import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatButtonComponent } from '../chat-button/chat-button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { siteConfigRoutes } from '@modules/site/config/site-config.routes';
import { ChatHistoryService } from '../../services/chat-history.service';  
import { ChatSession } from '../../models/chat-model';
import { SseService } from '../../services/sse-service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ChatButtonComponent, RouterLink, MatIconModule],
  templateUrl: './sidebar.html'
})

export class SidebarComponent implements OnInit, OnDestroy {
  @Input() agentId: string = '';
  
  readonly siteRoutesConfig = siteConfigRoutes;
  chatSessions$: Observable<ChatSession[]>;
  private destroy$ = new Subject<void>();
  
  // Estado del menú de cuenta
  isAccountMenuOpen = false;
  isLoggingOut = false;

  constructor(
    private chatHistoryService: ChatHistoryService,
    private sseService: SseService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.chatSessions$ = this.chatHistoryService.getCurrentSessions();
  }

  ngOnInit(): void {
    // Obtener el agentId de la ruta si no se pasó como Input
    if (!this.agentId || this.agentId.trim() === '') {
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
        if (params['agentId']) {
          this.agentId = params['agentId'];
          this.loadChatHistory();
        }
      });
    } else {
      this.loadChatHistory();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadChatHistory(): void {
    if (this.agentId && this.agentId.trim() !== '') {
      this.chatSessions$ = this.chatHistoryService.getChatSessions(this.agentId);
    }
  }

  startNewChat(): void {
    this.sseService.startNewChatSession();
    // Navegar a la página de chat sin parámetros de sesión para iniciar una nueva
    if (this.agentId && this.agentId.trim() !== '') {
      this.router.navigate(['/chat', this.agentId]);
    }
  }

  selectChatSession(session: ChatSession): void {
    // Navegar a la sesión específica (esto requerirá modificar las rutas para soportar session_id)
    if (this.agentId && this.agentId.trim() !== '' && session.session_id) {
      this.router.navigate(['/chat', this.agentId], { 
        queryParams: { session_id: session.session_id } 
      });
    }
  }

  clearConversations(): void {
    if (this.agentId && this.agentId.trim() !== '') {
      this.chatHistoryService.clearSessions(this.agentId);
    }
  }

  deleteSession(session: ChatSession): void {
    if (this.agentId && this.agentId.trim() !== '' && session.session_id) {
      this.chatHistoryService.deleteSession(session.session_id, this.agentId);
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  trackBySessionId(index: number, session: ChatSession): string {
    return session.session_id;
  }

  // Métodos para el menú de cuenta
  toggleAccountMenu(): void {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  getCurrentUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'usuario@ejemplo.com';
  }

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.isAccountMenuOpen = false;

    this.authService.logout().subscribe({
      next: (response: any) => {
        console.log('✅ Logout completado:', response);
        
        // Redireccionar al login o página principal
        this.router.navigate(['/login']).then(() => {
          console.log('🏠 Redirigido a login');
        }).catch(() => {
          window.location.href = '/login';
        });
      },
      error: (error: any) => {
        console.error('❌ Error en logout:', error);
        
        // Incluso si hay error, redirigir
        this.router.navigate(['/login']).catch(() => {
          window.location.href = '/login';
        });
      },
      complete: () => {
        this.isLoggingOut = false;
      }
    });
  }

  // Navegar de vuelta a la selección de agentes
  goToAgentSelection(): void {
    this.router.navigate(['/']);
  }

}
