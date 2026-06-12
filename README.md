# Plataforma RedNorte — Frontend 🏥

**RedNorte Frontend** es la interfaz de usuario de la Plataforma Inteligente para la Gestión de Listas de Espera Hospitalarias del **Servicio Público de Salud RedNorte**. Su propósito es proveer a pacientes, médicos y administradores una experiencia digital moderna, fluida e intuitiva para interactuar con todos los microservicios del backend.

Implementado como una **biblioteca de componentes React** (Library Mode con Vite), todo el código está estructurado bajo el patrón **Container / Presenter**, con cobertura de pruebas garantizada mediante **Vitest (≥ 85%)** y comunicación con el backend mediante el API Gateway a través de **Axios con interceptores JWT**.

---

## 🗺️ Páginas y Rutas de la Aplicación

| Ruta | Página | Acceso | Descripción |
|---|---|---|---|
| `/` | `HomePage` | Público | Landing Page de presentación del servicio RedNorte con CTA de registro e inicio de sesión |
| `/login` | `LoginPage` | Público | Formulario de inicio de sesión. Redirige automáticamente según el rol del usuario |
| `/register` | `RegisterPage` | Público | Formulario para crear una cuenta nueva como paciente |
| `/medico` | `ListaEsperaContainer` | ROLE_MEDICO, ROLE_ADMIN | Consola de gestión de la lista de espera hospitalaria con reasignación automática |
| `/paciente` | `CitasDashboardContainer` | ROLE_PACIENTE, ROLE_MEDICO, ROLE_ADMIN | Portal del paciente: consulta de citas, historial y previsión de salud |
| `/admin` | `AdminDashboardPage` | ROLE_ADMIN | Dashboard de administración con historial completo de reasignaciones del sistema |

---

## 👤 Roles de Usuario

El sistema maneja 3 roles distintos con accesos diferenciados:

| Rol | Acceso a |
|---|---|
| `ROLE_ADMIN` | Todas las páginas: `/medico`, `/paciente`, `/admin` |
| `ROLE_MEDICO` | Consola de lista de espera (`/medico`) y portal del paciente (`/paciente`) |
| `ROLE_PACIENTE` | Portal personal de citas (`/paciente`) |

> Al iniciar sesión, la aplicación detecta el rol del JWT y redirige automáticamente a la sección correspondiente.

---

## 📂 Estructura del Proyecto

```
RedNorte-frontend/
├── src/
│   ├── pages/                    # Páginas completas de la aplicación
│   │   ├── HomePage.tsx              # Landing Page con glassmorphism y animaciones
│   │   ├── LoginPage.tsx             # Inicio de sesión con JWT y redirección por rol
│   │   ├── RegisterPage.tsx          # Registro de nuevos pacientes
│   │   └── AdminDashboardPage.tsx    # Panel de administración
│   ├── components/               # Presenters: componentes visuales puros
│   │   ├── ListaEsperaTable.tsx      # Tabla premium de gestión de atenciones
│   │   ├── CitasDashboard.tsx        # Portal del paciente (render)
│   │   ├── ProtectedRoute.tsx        # HOC de autorización por rol
│   │   └── index.ts
│   ├── containers/               # Smart components con lógica asíncrona
│   │   ├── ListaEsperaContainer.tsx  # Gestiona estado de atenciones y reasignaciones
│   │   └── CitasDashboardContainer.tsx # Gestiona estado del portal BFF
│   ├── hooks/
│   │   └── useListasEspera.tsx       # Hook y Context global: auth, datos, API calls
│   ├── services/
│   │   └── api.ts                    # Instancia Axios con interceptores JWT
│   ├── layouts/
│   │   └── MainLayout.tsx            # Layout base con navegación para rutas protegidas
│   ├── styles/
│   │   └── main.css                  # Sistema de diseño HSL, variables CSS y temas
│   ├── App.tsx                   # Enrutador principal (React Router)
│   └── main.tsx                  # Punto de entrada React
├── vite.config.ts                # Configuración Vite: Library Mode + Vitest (>85%)
└── package.json                  # Scripts NPM y dependencias
```

---

## 🏗️ Arquitectura: Patrón Container / Presenter

La aplicación sigue estrictamente este patrón para separar responsabilidades:

- **Contenedores** (`src/containers/`): Componentes *inteligentes*. Conectados al hook `useListasEspera`, realizan peticiones HTTP y orquestan el estado. Inyectan datos y callbacks a los Presenters.
- **Presentadores** (`src/components/`): Componentes *pasivos*. Solo pintan la interfaz según las props recibidas. No realizan peticiones directas a la API.

---

## 🔗 Integración con el Backend

Toda la comunicación con el backend pasa por el **API Gateway** (`http://localhost:8080`). El servicio `api.ts` usa interceptores de Axios para:

1. **Request Interceptor**: Inyecta automáticamente el token JWT desde `localStorage` en cada petición.
2. **Response Interceptor**: Si detecta un `401 Unauthorized`, limpia las credenciales del `localStorage` para forzar un nuevo login.

### Endpoints consumidos

| Acción | Endpoint | Microservicio destino |
|---|---|---|
| Login | `POST /api/v1/auth/login` | ms-usuarios |
| Registro | `POST /api/v1/auth/register` | ms-usuarios |
| Lista de espera | `GET /api/listas-espera/atenciones` | ms-listas-espera |
| Registrar atención | `POST /api/listas-espera/atenciones` | ms-listas-espera |
| Reasignar | `POST /api/reasignacion/procesar/{id}` | ms-reasignacion |
| Portal paciente | `GET /api/portal-paciente/perfil/{rut}` | ms-portal-paciente |
| Estadísticas | `GET /api/v1/auditoria/estadisticas` | ms-auditoria |

---

## 🚀 Instrucciones de Desarrollo Local

### Requisitos
- Node.js 18+ y npm instalados
- Backend (`RedNorte-backend`) corriendo con Docker o localmente

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:8080
```

### 3. Levantar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

### 4. Flujo de usuario recomendado
1. Visita `http://localhost:5173` → Landing Page de RedNorte
2. Haz clic en **"Registrarme"** para crear una cuenta de paciente
3. O usa las **cuentas de demostración** en `/login`:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `medico` | `medico123` | Médico Asistencial |
| `paciente` | `paciente123` | Paciente |

---

## 🧪 Testing con Vitest (Cobertura ≥ 85%)

```bash
# Ejecutar todas las pruebas
npm test

# Generar reporte de cobertura
npm run test:coverage
```

Los umbrales de cobertura están configurados estrictamente en `vite.config.ts`:
- **Lines**: ≥ 85%
- **Functions**: ≥ 85%
- **Branches**: ≥ 85%
- **Statements**: ≥ 85%

---

## 📦 Compilar para Producción / Distribución NPM

```bash
npm run build
```

Genera en `/dist`:
- `rednorte-frontend.js` — Bundle ES Module
- `rednorte-frontend.umd.cjs` — Bundle UMD (compatibilidad universal)
- `dist/src/index.d.ts` — Tipos TypeScript autogenerados

El paquete puede instalarse en otros proyectos del ecosistema RedNorte como `@rednorte/ui`.
