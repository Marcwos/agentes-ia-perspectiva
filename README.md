# 🤖 Agentes Inteligentes

Sistema de agentes inteligentes construido con **FastAPI** y **Angular** que permite interactuar con múltiples agentes especializados usando modelos de lenguaje Llama a través de la API de Groq.

## 🚀 Características

- **5 Agentes Especializados**: Web Search, Finance, Wikipedia, HackerNews, Python
- **Autenticación JWT**: Sistema completo de registro y login
- **Base de Datos Unificada**: SQLite para usuarios y conversaciones
- **API RESTful**: Backend robusto con FastAPI
- **Frontend Moderno**: Interfaz Angular responsive

## 🏗️ Arquitectura

```
├── backend/           # API FastAPI con agentes inteligentes
├── frontend/          # Aplicación Angular
├── tmp/              # Base de datos SQLite
└── DOCUMENTATION.md  # Guía completa de creación
```

## ⚡ Inicio Rápido

### 1. Configurar Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno
- Obtener API key de [Groq Console](https://console.groq.com)
- Completar archivos en `backend/core/envs/`

### 3. Ejecutar
```bash
# Backend
python main.py

# Frontend (nueva terminal)
cd frontend
npm install
ng serve
```

### 4. Acceder
- **Backend API**: http://127.0.0.1:8000
- **Frontend**: http://localhost:4200  
- **Agentes UI**: http://127.0.0.1:8000/agents

## 🤖 Agentes Disponibles

| Agente | Descripción | Herramientas |
|--------|-------------|--------------|
| **Marcwos Agent** | Búsqueda web | DuckDuckGo |
| **Josue Agent** | Análisis financiero | Yahoo Finance |
| **Wikipedia Agent** | Enciclopedia | Wikipedia API |
| **HackerNews Agent** | Noticias tech | HackerNews API |
| **Python Agent** | Programación | Python Interpreter |

## 📋 Requisitos

- **Python 3.8+**
- **Node.js 18+**
- **API Key de Groq** (gratis)

## 🛠️ Stack Tecnológico

### Backend
- **FastAPI** - Framework web moderno
- **agno** - Librería de agentes inteligentes  
- **SQLAlchemy** - ORM para base de datos
- **SQLite** - Base de datos ligera
- **JWT** - Autenticación segura

### Frontend  
- **Angular 17+** - Framework frontend
- **Angular Material** - Componentes UI
- **TypeScript** - Lenguaje tipado

### AI/ML
- **Groq API** - Inferencia rápida de LLMs
- **Llama 3.3 70B** - Modelo de lenguaje
- **Function Calling** - Herramientas especializadas

## 📖 Documentación Completa

Ver [DOCUMENTATION.md](./DOCUMENTATION.md) para:
- Proceso de creación paso a paso
- Arquitectura detallada  
- Configuración avanzada
- Troubleshooting
- Contribución

## 📡 API Endpoints

### Agentes
- `GET /agents/` - Lista de agentes disponibles
- `POST /agents/v1/playground/agents/{agent_id}/runs` - Enviar mensaje a agente

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/me` - Usuario actual

## 🔒 Seguridad

- ✅ API Keys protegidas en variables de entorno
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT seguros
- ✅ CORS configurado
- ✅ Validación de datos con Pydantic

## 🐛 Troubleshooting

**Error: "Invalid API Key"**
```bash
# Verificar en backend/core/envs/.agents.env
GROQ_API_KEY=tu_api_key_real_aqui
```

**Error: CORS**
```bash
# Verificar origins en backend/core/envs/.app.dev.env
ALLOWED_ORIGINS=["http://localhost:4200"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [Groq](https://groq.com) por la API de inferencia rápida
- [agno](https://docs.phidata.com/) por la librería de agentes
- [FastAPI](https://fastapi.tiangolo.com/) por el framework
- [Angular](https://angular.io/) por el frontend

---

**¡Construido con ❤️ para demostrar el poder de los agentes inteligentes!**
