# 🤖 Agentes Inteligentes - Guía de Creación del Proyecto

## 📋 Descripción del Proyecto

Sistema de agentes inteligentes construido con **FastAPI** (backend) y **Angular** (frontend) que permite interactuar con múltiples agentes especializados usando la API de Groq y modelos de lenguaje Llama.

### 🎯 Características principales:
- **5 Agentes especializados**: Web, Finance, Wikipedia, HackerNews, Python
- **Autenticación JWT**: Sistema completo de login/registro
- **Base de datos SQLite**: Almacenamiento unificado
- **API RESTful**: Backend robusto con FastAPI
- **Frontend moderno**: Interfaz Angular responsive

---

## 🏗️ Arquitectura del Sistema

```
Agentes-inteligentes/
├── backend/                    # API FastAPI
│   ├── core/                   # Configuración central
│   │   ├── settings/           # Variables de entorno
│   │   └── envs/              # Archivos .env
│   ├── agno_agents/           # Agentes inteligentes
│   │   └── agents/            # Definición de cada agente
│   ├── modules/               # Módulos de la aplicación
│   │   ├── auth/              # Autenticación JWT
│   │   └── user/              # Gestión de usuarios
│   ├── db/                    # Base de datos SQLite
│   └── requirements.txt       # Dependencias Python
├── frontend/                  # Aplicación Angular
├── tmp/                       # Base de datos SQLite
│   └── agents.db             # BD unificada
└── README.md
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
