# 🤖 Agentes Inteligentes - Guía de Creación del Proyecto

## 📋 Descripción del Proyecto

Sistema de agentes inteligentes construido con **FastAPI** (backend) y **Angular** (frontend) que permite interactuar con múltiples agentes especializados usando la API de Groq y modelos de lenguaje Llama. El proyecto utiliza un tema **negro y verde** moderno y profesional.

### 🎯 Características principales:
- **5 Agentes especializados**: Web, Finance, Wikipedia, HackerNews, Python
- **Autenticación JWT completa**: Sistema de login/logout/registro
- **Base de datos SQLite unificada**: Almacenamiento único para usuarios y agentes
- **API RESTful robusta**: Backend escalable con FastAPI
- **Frontend moderno**: Interfaz Angular responsive con tema negro-verde
- **Gestión de historial**: Sistema completo de conversaciones
- **Logout seguro**: Limpieza de sesiones tanto en cliente como servidor

---

## 🏗️ Arquitectura del Sistema

```
Agentes-inteligentes/
├── backend/                    # API FastAPI
│   ├── core/                   # Configuración central
│   │   ├── settings/           # Variables de entorno por módulo
│   │   └── envs/              # Archivos .env seguros
│   ├── agno_agents/           # Agentes inteligentes
│   │   ├── agent_app.py       # Aplicación de agentes
│   │   └── agents/            # Definición de cada agente
│   ├── modules/               # Módulos de la aplicación
│   │   ├── auth/              # Autenticación JWT completa
│   │   └── user/              # Gestión de usuarios
│   ├── db/                    # Base de datos SQLite
│   │   └── database.py        # Configuración SQLAlchemy
│   ├── tmp/                   # Base de datos unificada
│   │   └── agents.db          # SQLite con usuarios + agentes
│   └── requirements.txt       # Dependencias Python optimizadas
├── frontend/                  # Aplicación Angular
│   ├── src/app/modules/       # Módulos organizados
│   │   ├── site/              # Página principal
│   │   ├── chat/              # Sistema de chat
│   │   ├── login/             # Autenticación
│   │   └── agent/             # Gestión de agentes
│   └── src/shared/            # Servicios compartidos
├── LOGOUT_GUIDE.md           # Guía específica de logout
└── README.md                 # Documentación principal
```

---

## 🛠️ Proceso de Creación Paso a Paso

### **Fase 1: Configuración Inicial del Proyecto**

#### 1.1 Crear estructura de carpetas
```bash
mkdir Agentes-inteligentes
cd Agentes-inteligentes
mkdir backend frontend tmp
```

#### 1.2 Inicializar Git
```bash
git init
git remote add origin https://github.com/usuario/agentes-ia-perspectiva.git
```

### **Fase 2: Backend - FastAPI + Agentes**

#### 2.1 Crear entorno virtual Python
```bash
cd backend
python -m venv venv
# En Windows:
venv\Scripts\Activate.ps1
# En Linux/Mac:
source venv/bin/activate
```

#### 2.2 Instalar dependencias principales
```bash
pip install fastapi uvicorn
pip install agno==1.5.8  # Librería para agentes inteligentes
pip install sqlalchemy  # ORM para base de datos
pip install pydantic-settings
pip install passlib bcrypt python-jose[cryptography]
pip install python-multipart
```

#### 2.3 Configurar sistema de settings modular
**Archivo: `core/settings/app_settings.py`**
```python
from pydantic_settings import BaseSettings
from typing import List

class AppSettings(BaseSettings):
    app_name: str = "Proyecto Agentes"
    environment: str = "dev"
    debug: bool = True
    allowed_origins: List[str] = [
        "http://localhost:4200", 
        "http://127.0.0.1:4200"
    ]
    
    class Config:
        env_file = "core/envs/.app.dev.env"
```

**Archivo: `core/settings/database_settings.py`**
```python
from pydantic_settings import BaseSettings

class DatabaseSettings(BaseSettings):
    database_url: str = "sqlite:///./tmp/agents.db"
    db_name: str = "agentes_db"
    
    class Config:
        env_file = "core/envs/.db.dev.env"
```

**Archivo: `core/settings/jwt_settings.py`**
```python
from pydantic_settings import BaseSettings

class JWTSettings(BaseSettings):
    jwt_secret_key: str = "tu_clave_secreta_muy_segura"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60
    
    class Config:
        env_file = "core/envs/.jwt.env"
```

**Archivo: `core/settings/agents_settings.py`**
```python
from pydantic_settings import BaseSettings

class AgentsSettings(BaseSettings):
    model_id: str = "llama-3.3-70b-versatile"
    groq_api_key: str = "tu_api_key_aqui"
    
    # Collection Names para cada agente
    web_agent_collection_name: str = "web_agent"
    finance_agent_collection_name: str = "finance_agent"
    wikipedia_agent_collection_name: str = "wikipedia_agent"
    hackernews_agent_collection_name: str = "hackernews_agent"
    python_agent_collection_name: str = "python_agent"
    
    class Config:
        env_file = "core/envs/.agents.env"
```

#### 2.4 Configurar base de datos SQLite unificada
**Archivo: `db/database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# SQLite setup - Base de datos unificada
engine = create_engine(
    settings.database.database_url, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 2.5 Crear agentes inteligentes con almacenamiento unificado
**Archivo: `agno_agents/agents/web_agent.py`**
```python
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.storage.sqlite import SqliteStorage
from core.config import settings

web_agent = Agent(
    agent_id="web_agent",
    name="Marcwos Agent",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[DuckDuckGoTools()],
    instructions=["Always include sources"],
    description="Web Agent specializes in web searches and information retrieval.",
    storage=SqliteStorage(
        table_name=settings.agents.web_agent_collection_name,
        db_file="tmp/agents.db"  # ¡Base de datos unificada!
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)
```

**Archivo: `agno_agents/agents/python_agent.py`**
```python
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.python import PythonTools
from agno.storage.sqlite import SqliteStorage
from core.config import settings

python_agent = Agent(
    agent_id="python_agent",
    name="Python Agent",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[PythonTools()],
    instructions=[
        "You are a Python programming expert.",
        "When using tools that require boolean parameters, use True/False as boolean values.",
        "For the 'overwrite' parameter, always use boolean True or False, never strings.",
        "Example: save_to_file_and_run(code='print(\"hello\")', filename='script.py', overwrite=True)"
    ],
    description="Python Agent specializes in creating, debugging, and executing Python code.",
    storage=SqliteStorage(
        table_name=settings.agents.python_agent_collection_name,
        db_file="tmp/agents.db"  # ¡Base de datos unificada!
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
    show_tool_calls=True
)
```

#### 2.6 Sistema de autenticación JWT completo
**Archivo: `modules/auth/services/auth_service.py`**
```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from modules.user.model.user_model import UserModel

class AuthService:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password):
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=60)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, "SECRET_KEY", algorithm="HS256")
    
    def login_user(self, user: UserCreateSchema, db: Session):
        authenticated_user = self.authenticate_user(user.email, user.password, db)
        if not authenticated_user:
            raise HTTPException(status_code=401, detail="Incorrect credentials")
        
        access_token = self.create_access_token(
            data={"sub": authenticated_user.email, "user_id": str(authenticated_user.id)}
        )
        return LoginResponseSchema(access_token=Token(access_token=access_token, token_type="bearer"), user=UserResponseSchema(id=authenticated_user.id, email=authenticated_user.email))
    
    def logout_user(self, token: str, db: Session):
        # Validar token y limpiar sesión
        payload = self.decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return LogoutResponseSchema(
            message="Logout successful",
            detail="Session closed successfully. Please remove the token from client."
        )
```

**Archivo: `modules/user/model/user_model.py`**
```python
from sqlalchemy import Column, Integer, String
from db.database import Base

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
```

#### 2.7 Archivo principal FastAPI
**Archivo: `main.py`**
```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agno_agents.agent_app import agent_app
from core.config import settings
from modules.user import users_router
from modules.auth import auth_router
from db.database import engine, Base

# Crear tablas automáticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agentes Inteligentes API", version="2.0.0")

# Montar aplicación de agentes
app.mount("/agents", agent_app)

# Incluir routers
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

### **Fase 3: Frontend Angular con Tema Negro-Verde**

#### 3.1 Crear proyecto Angular
```bash
cd frontend
ng new . --routing --style=css
npm install @angular/material
npm install @angular/cdk
```

#### 3.2 Configurar tema global negro-verde
**Archivo: `src/styles.css`**
```css
@import "tailwindcss";

html, body {
  height: 100%;
  background: #101915;
  color: #a8ff60;
}

body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
  background: #101915;
  color: #a8ff60;
}

/* Scrollbar verde */
::-webkit-scrollbar {
  width: 8px;
  background: #101915;
}
::-webkit-scrollbar-thumb {
  background: #1e2d1b;
  border-radius: 4px;
}

/* Botones principales */
.btn, button {
  background: linear-gradient(90deg, #1e2d1b 0%, #2ecc40 100%);
  color: #a8ff60;
  border: none;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.btn:hover, button:hover {
  background: linear-gradient(90deg, #2ecc40 0%, #1e2d1b 100%);
  color: #d0ffb0;
}

/* Inputs */
input, textarea, select {
  background: #181f1b;
  color: #a8ff60;
  border: 1px solid #2ecc40;
  border-radius: 6px;
}

/* Tarjetas */
.card, .panel {
  background: #181f1b;
  color: #a8ff60;
  border: 1px solid #2ecc40;
  border-radius: 10px;
}

/* Títulos */
h1, h2, h3, h4, h5, h6 {
  color: #a8ff60;
}

/* Sombra verde */
.shadow-green {
  box-shadow: 0 2px 8px 0 #2ecc4060;
}
```

#### 3.3 Servicio de autenticación completo
**Archivo: `src/app/shared/services/auth.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { environment } from '@environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.baseUrl.replace(/\/$/, '');

  constructor(private http: HttpClient, private userService: UserService) {}

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          const userInfo = {
            email: response.user.email,
            userId: response.user.id,
            loginTime: Date.now(),
            accessToken: response.access_token.access_token
          };
          this.userService.setUserSession(userInfo);
        })
      );
  }

  logout(): Observable<any> {
    const token = this.userService.getAccessToken();
    
    if (!token) {
      this.userService.logout();
      return of(null);
    }

    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});

    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        catchError(error => {
          console.error('Error en logout del servidor:', error);
          return of({ message: 'Client logout', detail: 'Server logout failed but client was cleared' });
        }),
        tap(() => this.userService.logout())
      );
  }

  isAuthenticated(): boolean {
    return this.userService.isLoggedIn();
  }
}
```

#### 3.4 Componente de logout reutilizable
**Archivo: `src/app/shared/components/logout-button.component.ts`**
```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="logout-btn"
      (click)="logout()"
      [disabled]="isLoggingOut">
      
      <span *ngIf="!isLoggingOut">🚪 Cerrar Sesión</span>
      <span *ngIf="isLoggingOut">⏳ Cerrando...</span>
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
      transition: all 0.3s ease;
    }
    .logout-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #c0392b, #a93226);
      transform: translateY(-1px);
    }
  `]
})
export class LogoutButtonComponent {
  isLoggingOut = false;

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
      complete: () => this.isLoggingOut = false
    });
  }
}
```

### **Fase 4: Configuración de Variables de Entorno**

#### 4.1 Crear archivos .env seguros
**Archivo: `core/envs/.agents.env`**
```env
# Agents Configuration
MODEL_ID=llama-3.3-70b-versatile
GROQ_API_KEY=tu_api_key_de_groq_aqui

# Collection Names
WEB_AGENT_COLLECTION_NAME=web_agent
FINANCE_AGENT_COLLECTION_NAME=finance_agent
WIKIPEDIA_AGENT_COLLECTION_NAME=wikipedia_agent
HACKERNEWS_AGENT_COLLECTION_NAME=hackernews_agent
PYTHON_AGENT_COLLECTION_NAME=python_agent
```

**Archivo: `core/envs/.db.dev.env`**
```env
# SQLite Configuration for Development Environment
DATABASE_URL=sqlite:///./tmp/agents.db
DB_NAME=agentes_db
```

**Archivo: `core/envs/.jwt.env`**
```env
# JWT Configuration
JWT_SECRET_KEY=tu_clave_secreta_muy_segura_64_caracteres_minimo
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
```

**Archivo: `core/envs/.app.dev.env`**
```env
# Application Configuration for Development
APP_NAME=Agentes Inteligentes
ENVIRONMENT=dev
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:4200","http://127.0.0.1:4200"]
```

### **Fase 5: Migración de MongoDB a SQLite**

#### 5.1 Razones para la migración:
- **Simplicidad**: Sin servidor separado de BD
- **Desarrollo**: Más fácil para desarrollo local
- **Unificación**: Una sola BD para usuarios y agentes
- **Portabilidad**: Un solo archivo de base de datos
- **Deployment**: Más simple de deployar

#### 5.2 Proceso de migración:
1. **Eliminar dependencias MongoDB**: `motor`, `pymongo`
2. **Configurar SQLAlchemy**: Para manejo de usuarios
3. **Unificar storage**: Todos los agentes usan `tmp/agents.db`
4. **Migrar modelos**: De Pydantic/motor a SQLAlchemy
5. **Actualizar servicios**: Consultas síncronas con SQLAlchemy

#### 5.3 Archivos eliminados durante la migración:
```bash
# Archivos MongoDB obsoletos eliminados:
backend/modules/mongodb.py
backend/core/db.py  
backend/db/utils/base_model.py
backend/db/utils/convert_id.py
```

### **Fase 6: Sistema de Historial**

#### 6.1 Almacenamiento del historial:
- **Backend**: `tmp/agents.db` - Conversaciones de agentes en tablas separadas
- **Frontend**: `localStorage` - Sesiones de chat por usuario

#### 6.2 Gestión del historial:
```typescript
// ChatHistoryService - Métodos principales:
getChatSessions(agentId: string)    // Obtener historial
deleteSession(sessionId: string)    // Borrar sesión específica
clearSessions(agentId: string)      // Limpiar todo el historial
```

---

## 🚀 Comandos para Ejecutar

### Backend
```bash
cd backend
# Activar entorno virtual
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python main.py
```

### Frontend
```bash
cd frontend
npm install
ng serve --open
```

---

## 🔧 Configuración Requerida

### 1. API Key de Groq
1. Crear cuenta en [console.groq.com](https://console.groq.com)
2. Generar API key
3. Agregar en `core/envs/.agents.env`:
   ```env
   GROQ_API_KEY=tu_api_key_real_aqui
   ```

### 2. Configurar JWT Secret
1. Generar clave secura de 64 caracteres
2. Agregar en `core/envs/.jwt.env`:
   ```env
   JWT_SECRET_KEY=tu_clave_secreta_muy_segura_de_64_caracteres_minimo
   ```

### 3. Base de datos
- SQLite se crea automáticamente en `tmp/agents.db`
- No requiere instalación ni configuración adicional

---

## 📦 Dependencias Principales

### Backend (Python)
- **FastAPI 0.115.12**: Framework web moderno y rápido
- **agno 1.5.8**: Librería para agentes inteligentes
- **SQLAlchemy 2.0.41**: ORM para base de datos
- **Uvicorn**: Servidor ASGI de alto rendimiento
- **Pydantic**: Validación de datos y settings
- **python-jose**: Manejo de tokens JWT
- **passlib**: Hashing seguro de contraseñas
- **bcrypt**: Algoritmo de hashing
- **groq**: Cliente para API de Groq

### Frontend (Angular)
- **Angular 17+**: Framework frontend moderno
- **Angular Material**: Componentes UI profesionales
- **Tailwind CSS**: Framework CSS utilitario
- **RxJS**: Programación reactiva
- **TypeScript**: Superset tipado de JavaScript

### Herramientas de Agentes
- **DuckDuckGo Search**: Búsquedas web
- **Yahoo Finance**: Datos financieros
- **Wikipedia API**: Información enciclopédica
- **HackerNews API**: Noticias tecnológicas
- **Python Tools**: Ejecución de código Python

---

## 🎯 Endpoints Principales

### Agentes
- `GET /agents/` - Lista de agentes disponibles
- `POST /agents/v1/playground/agents/{agent_id}/runs` - Enviar mensaje a agente

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión (🆕)
- `GET /auth/me` - Usuario actual

### Usuarios
- `GET /users/` - Lista usuarios (admin)
- `GET /users/{id}` - Usuario específico

---

## 🛡️ Seguridad Implementada

### Backend:
- ✅ API Keys protegidas en variables de entorno
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT seguros con expiración
- ✅ Validación de datos con Pydantic
- ✅ CORS configurado correctamente
- ✅ Logout con validación de tokens

### Frontend:
- ✅ Guardias de autenticación (AuthGuard)
- ✅ Limpieza segura de localStorage en logout
- ✅ Manejo de tokens en headers HTTP
- ✅ Validación de sesiones expiradas
- ✅ Redirección automática post-logout

---

## 🎨 Tema Visual

### Paleta de Colores:
- **Fondo principal**: `#101915` (Negro verdoso)
- **Texto principal**: `#a8ff60` (Verde claro)
- **Acentos**: `#2ecc40` (Verde vibrante)
- **Secundario**: `#1e2d1b` (Verde oscuro)
- **Paneles**: `#181f1b` (Negro-verde intermedio)

### Componentes Estilizados:
- Botones con gradientes verde
- Inputs con bordes verdes
- Sidebar con tema oscuro
- Scrollbars personalizadas
- Sombras verdes suaves

---

## 🏃‍♂️ Guía de Inicio Rápido

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/Marcwos/agentes-ia-perspectiva.git
   cd agentes-ia-perspectiva
   ```

2. **Configurar backend**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**
   - Obtener API key de Groq en [console.groq.com](https://console.groq.com)
   - Completar archivos en `backend/core/envs/`
   - Generar JWT secret seguro

4. **Ejecutar backend**
   ```bash
   python main.py
   ```

5. **Ejecutar frontend** (nueva terminal)
   ```bash
   cd frontend
   npm install
   ng serve --open
   ```

6. **Acceder a la aplicación**
   - Backend API: http://127.0.0.1:8000
   - Frontend: http://localhost:4200
   - Agentes UI: http://127.0.0.1:8000/agents
   - Documentación API: http://127.0.0.1:8000/docs

---

## 🐛 Troubleshooting Común

### Error: "Invalid API Key"
- Verificar API key de Groq en `.agents.env`
- Asegurar que no hay espacios extra
- Confirmar que la API key es válida en [console.groq.com](https://console.groq.com)

### Error: "tool call validation failed" (Python Agent)
- Verificar instrucciones del agente sobre parámetros boolean
- El agente debe usar `overwrite=True` (boolean) no `"true"` (string)
- Reiniciar backend después de cambios en agentes

### Error: "Database locked"
- Cerrar todas las conexiones a la BD
- Reiniciar el servidor backend
- Verificar que no hay procesos usando `tmp/agents.db`

### Error: "CORS blocked"
- Verificar `allowed_origins` en `.app.dev.env`
- Asegurar que el frontend esté en la lista de orígenes permitidos
- Reiniciar backend después de cambios en CORS

### Error: "Module not found"
- Verificar que el entorno virtual esté activado
- Reinstalar dependencias: `pip install -r requirements.txt`
- Verificar versiones de Python (3.8+)

### Error de autenticación frontend
- Verificar que el backend esté ejecutándose
- Limpiar localStorage del navegador
- Verificar configuración de environment.development.ts

---

## 📁 Estructura de Base de Datos

### SQLite: `tmp/agents.db`
```sql
-- Tabla de usuarios
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE,
    hashed_password VARCHAR
);

-- Tablas de agentes (creadas automáticamente por agno)
CREATE TABLE web_agent (...);
CREATE TABLE finance_agent (...);
CREATE TABLE wikipedia_agent (...);
CREATE TABLE hackernews_agent (...);
CREATE TABLE python_agent (...);
```

### localStorage (Frontend)
```javascript
// Estructura de datos en localStorage
{
  "userInfo": {
    "email": "usuario@ejemplo.com",
    "userId": "123",
    "loginTime": 1643723400000,
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "isLoggedIn": "true",
  "chat_sessions_123_web_agent": [
    {
      "session_id": "session_abc123",
      "agent_id": "web_agent",
      "title": "Conversación sobre...",
      "timestamp": 1643723400000,
      "messages": [...]
    }
  ]
}
```

---

## 🔄 Historial y Almacenamiento

### Ubicaciones del Historial:
1. **Conversaciones de Agentes**: `backend/tmp/agents.db` (SQLite)
2. **Sesiones de Chat**: `localStorage` del navegador
3. **Usuarios**: `backend/tmp/agents.db` tabla `users`

### Comandos de Gestión:
```bash
# Ver historial de agentes (SQLite)
sqlite3 backend/tmp/agents.db
.tables
SELECT * FROM web_agent LIMIT 10;

# Limpiar historial específico
DELETE FROM web_agent WHERE user_id = 'usuario_id';

# Ver localStorage (Navegador DevTools)
localStorage.getItem('chat_sessions_123_web_agent');
```

---

## 📚 Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Agno - Agentes Inteligentes](https://docs.phidata.com/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---

## 🚀 Mejoras Futuras

### Funcionalidades Planeadas:
- [ ] Blacklist de tokens JWT para logout más seguro
- [ ] Modo oscuro/claro intercambiable
- [ ] Notificaciones en tiempo real
- [ ] Exportar conversaciones en PDF/JSON
- [ ] Gestión de archivos subidos
- [ ] Dashboard de analíticas
- [ ] API rate limiting
- [ ] Logs estructurados
- [ ] Tests automatizados
- [ ] Docker containers

### Optimizaciones:
- [ ] Lazy loading de componentes Angular
- [ ] Compresión de respuestas HTTP
- [ ] Cache de consultas frecuentes
- [ ] Optimización de imágenes
- [ ] PWA (Progressive Web App)
- [ ] Service Workers

---

## 👥 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guidelines:
- Seguir convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación
- Usar commits descriptivos

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- [Groq](https://groq.com) por la API de inferencia rápida de LLMs
- [Phidata (agno)](https://docs.phidata.com/) por la librería de agentes
- [FastAPI](https://fastapi.tiangolo.com/) por el framework web
- [Angular](https://angular.io/) por el framework frontend
- [SQLAlchemy](https://sqlalchemy.org/) por el ORM
- [Tailwind CSS](https://tailwindcss.com/) por el framework CSS

---

**¡Construido con ❤️ para demostrar el poder de los agentes inteligentes!**

*Última actualización: Agosto 2025 - v2.0.0*

---

## 🛠️ Proceso de Creación Paso a Paso

### **Fase 1: Configuración Inicial del Proyecto**

#### 1.1 Crear estructura de carpetas
```bash
mkdir Agentes-inteligentes
cd Agentes-inteligentes
mkdir backend frontend tmp
```

#### 1.2 Inicializar Git
```bash
git init
git remote add origin https://github.com/usuario/agentes-ia-perspectiva.git
```

### **Fase 2: Backend - FastAPI + Agentes**

#### 2.1 Crear entorno virtual Python
```bash
cd backend
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

#### 2.2 Instalar dependencias principales
```bash
pip install fastapi uvicorn
pip install agno  # Librería para agentes inteligentes
pip install sqlalchemy sqlite3
pip install pydantic-settings
pip install passlib bcrypt python-jose
pip install python-multipart
```

#### 2.3 Configurar sistema de settings
**Archivo: `core/settings/app_settings.py`**
```python
from pydantic_settings import BaseSettings
from typing import List

class AppSettings(BaseSettings):
    app_name: str = "Proyecto Agentes"
    environment: str = "dev"
    debug: bool = True
    allowed_origins: List[str] = [
        "http://localhost:4200", 
        "http://127.0.0.1:4200"
    ]
    
    class Config:
        env_file = "core/envs/.app.dev.env"
```

#### 2.4 Configurar base de datos SQLite
**Archivo: `db/database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_engine(
    settings.database.database_url, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 2.5 Crear agentes inteligentes
**Archivo: `agno_agents/agents/web_agent.py`**
```python
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.storage.sqlite import SqliteStorage
from core.config import settings

web_agent = Agent(
    agent_id="web_agent",
    name="Marcwos Agent",
    model=Groq(id=settings.agents.model_id, api_key=settings.agents.groq_api_key),
    tools=[DuckDuckGoTools()],
    instructions=["Always include sources"],
    storage=SqliteStorage(
        table_name=settings.agents.web_agent_collection_name,
        db_file="tmp/agents.db"
    ),
    add_datetime_to_instructions=True,
    add_history_to_messages=True,
    num_history_responses=5,
    markdown=True,
)
```

#### 2.6 Sistema de autenticación JWT
**Archivo: `modules/auth/services/auth_service.py`**
```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

class AuthService:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password):
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=60)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, "SECRET_KEY", algorithm="HS256")
```

#### 2.7 Archivo principal FastAPI
**Archivo: `main.py`**
```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agno_agents.agent_app import agent_app
from core.config import settings
from modules.user import users_router
from modules.auth import auth_router
from db.database import engine, Base

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.mount("/agents", agent_app)

app.include_router(users_router, prefix="/users", tags=["user"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
```

### **Fase 3: Configuración de Variables de Entorno**

#### 3.1 Crear archivos .env
**Archivo: `core/envs/.agents.env`**
```env
# Agents Configuration
MODEL_ID=llama-3.3-70b-versatile
GROQ_API_KEY=tu_api_key_aqui

# Collection Names
WEB_AGENT_COLLECTION_NAME=web_agent
FINANCE_AGENT_COLLECTION_NAME=finance_agent
```

**Archivo: `core/envs/.db.dev.env`**
```env
# SQLite Configuration
DATABASE_URL=sqlite:///./tmp/agents.db
DB_NAME=agentes_db
```

**Archivo: `core/envs/.jwt.env`**
```env
# JWT Configuration
JWT_SECRET_KEY=tu_clave_secreta_muy_segura
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
```

### **Fase 4: Frontend Angular**

#### 4.1 Crear proyecto Angular
```bash
cd frontend
ng new . --routing --style=css
npm install @angular/material
npm install @angular/cdk
```

#### 4.2 Configurar servicios HTTP
```typescript
// src/app/services/agent.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://127.0.0.1:8000/agents';

  constructor(private http: HttpClient) { }

  sendMessage(agentId: string, message: string) {
    return this.http.post(`${this.apiUrl}/v1/playground/agents/${agentId}/runs`, {
      message: message
    });
  }
}
```

### **Fase 5: Integración y Deployment**

#### 5.1 Crear archivo requirements.txt
```bash
pip freeze > requirements.txt
```

#### 5.2 Configurar .gitignore
```gitignore
# Python
__pycache__/
*.py[cod]
venv/
*.env

# Database
*.db
*.sqlite

# IDEs
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

#### 5.3 Scripts de inicio
**Archivo: `start.sh` (Linux/Mac)**
```bash
#!/bin/bash
cd backend
source venv/bin/activate
python main.py
```

**Archivo: `start.bat` (Windows)**
```batch
@echo off
cd backend
call venv\Scripts\activate
python main.py
```

---

## 🚀 Comandos para Ejecutar

### Backend
```bash
cd backend
# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python main.py
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

---

## 🔧 Configuración Requerida

### 1. API Key de Groq
1. Crear cuenta en [console.groq.com](https://console.groq.com)
2. Generar API key
3. Agregar en `core/envs/.agents.env`

### 2. Base de datos
- SQLite se crea automáticamente en `tmp/agents.db`
- No requiere instalación adicional

### 3. Variables de entorno
Copiar y personalizar todos los archivos `.env` en `core/envs/`

---

## 📦 Dependencias Principales

### Backend (Python)
- **FastAPI**: Framework web moderno
- **agno**: Librería para agentes inteligentes
- **SQLAlchemy**: ORM para base de datos
- **Uvicorn**: Servidor ASGI
- **Pydantic**: Validación de datos
- **python-jose**: JWT tokens
- **passlib**: Hashing de contraseñas

### Frontend (Angular)
- **Angular 17+**: Framework frontend
- **Angular Material**: Componentes UI
- **HttpClient**: Cliente HTTP

---

## 🎯 Endpoints Principales

### Agentes
- `GET /agents/` - Lista de agentes
- `POST /agents/v1/playground/agents/{agent_id}/runs` - Enviar mensaje

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login
- `GET /auth/me` - Usuario actual

### Usuarios
- `GET /users/` - Lista usuarios
- `GET /users/{id}` - Usuario específico

---

## 🏃‍♂️ Guía de Inicio Rápido

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/usuario/agentes-ia-perspectiva.git
   cd agentes-ia-perspectiva
   ```

2. **Configurar backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**
   - Obtener API key de Groq
   - Completar archivos en `core/envs/`

4. **Ejecutar backend**
   ```bash
   python main.py
   ```

5. **Ejecutar frontend** (nueva terminal)
   ```bash
   cd frontend
   npm install
   ng serve
   ```

6. **Acceder a la aplicación**
   - Backend: http://127.0.0.1:8000
   - Frontend: http://localhost:4200
   - Agentes: http://127.0.0.1:8000/agents

---

## 🐛 Troubleshooting Común

### Error: "Invalid API Key"
- Verificar API key de Groq en `.agents.env`
- Asegurar que no hay espacios extra

### Error: "Database locked"
- Cerrar todas las conexiones a la BD
- Reiniciar el servidor

### Error: "CORS blocked"
- Verificar `allowed_origins` en configuración
- Asegurar que el frontend esté en la lista

### Error: "Module not found"
- Verificar que el entorno virtual esté activado
- Reinstalar dependencias: `pip install -r requirements.txt`

---

## 📚 Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [Agno - Agentes Inteligentes](https://docs.phidata.com/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Angular Documentation](https://angular.io/docs)

---

## 👥 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

**¡Proyecto creado con ❤️ para demostrar el poder de los agentes inteligentes!**
