import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserService, UserInfo } from './user.service';
import { environment } from '@environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: {
    access_token: string;
    token_type: string;
  };
  user: {
    id: string;
    email: string;
  };
}

export interface LogoutResponse {
  message: string;
  detail: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseUrl.replace(/\/$/, '') || 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  // Login del usuario
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar información del usuario en localStorage
          const userInfo: UserInfo = {
            email: response.user.email,
            userId: response.user.id,
            loginTime: Date.now(),
            accessToken: response.access_token.access_token
          };
          this.userService.setUserSession(userInfo);
          console.log('✅ Login exitoso:', response.user.email);
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
          throw error;
        })
      );
  }

  // Logout del usuario
  logout(): Observable<LogoutResponse | null> {
    const token = this.userService.getAccessToken();
    
    if (!token) {
      // Si no hay token, solo limpiar localStorage
      this.userService.logout();
      console.log('🚪 Logout local (sin token)');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<LogoutResponse>(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(response => {
          console.log('✅ Logout exitoso:', response?.message);
        }),
        catchError(error => {
          console.error('⚠️ Error en logout del servidor:', error);
          // Aunque falle el logout del servidor, limpiamos el cliente
          return of({ message: 'Client logout', detail: 'Server logout failed but client was cleared' });
        }),
        tap(() => {
          // Siempre limpiar localStorage al final
          this.userService.logout();
          console.log('🧹 Sesión local limpiada');
        })
      );
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.userService.isLoggedIn();
  }

  // Obtener información del usuario actual
  getCurrentUser(): UserInfo | null {
    return this.userService.getUserInfo();
  }

  // Obtener token de autorización
  getAuthToken(): string | null {
    return this.userService.getAccessToken();
  }

  // Verificar token con el servidor
  validateToken(): Observable<any> {
    const token = this.getAuthToken();
    
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/auth/me`, { headers })
      .pipe(
        catchError(error => {
          console.error('❌ Token inválido:', error);
          // Si el token es inválido, limpiar la sesión
          this.userService.logout();
          throw error;
        })
      );
  }

  // Registro de usuario
  register(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Registro exitoso:', response);
        }),
        catchError(error => {
          console.error('❌ Error en registro:', error);
          throw error;
        })
      );
  }
}
