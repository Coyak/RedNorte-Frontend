# 🏥 Plataforma RedNorte - Biblioteca de Componentes Frontend

Este proyecto constituye la interfaz y la **biblioteca de componentes reutilizables** del Frontend de la **Plataforma RedNorte**, un sistema inteligente de gestión de listas de espera hospitalarias diseñado para mejorar el rendimiento, mitigar cancelaciones de citas y dotar de transparencia a los pacientes de la red pública.

En cumplimiento con las directrices técnicas del examen, todos los componentes han sido construidos como **módulos NPM altamente reutilizables** utilizando **React**, **TypeScript**, **Vite (en Library Mode)** y **Custom CSS** con variables HSL dinámicas.

---

## 🚀 Características Clave

1.  **Módulo NPM Reutilizable (Library Mode)**: Configurado para compilarse en múltiples formatos de distribución (**ES Modules** y **UMD**) generando automáticamente sus archivos de definición de tipos TypeScript (`.d.ts`), permitiendo que cualquier hospital o centro médico de la red pública instale e integre estos componentes mediante un simple `npm install @rednorte/ui`.
2.  **Portal del Paciente (BFF Dashboard)**: Panel interactivo que consolida la ficha médica del paciente, su previsión de salud (FONASA, ISAPRE, etc.) y la visualización cronológica de sus citas médicas derivables.
3.  **Consola de Lista de Espera**: Tabla interactiva premium para la gestión administrativa de derivaciones, que permite filtrar por especialidad, orden de prioridad médica de gravedad y realizar reasignaciones instantáneas en caso de cancelaciones.
4.  **Simulador Integrado de Circuit Breaker (Resilience4j)**: Permite simular caídas de conexión con el backend (API Gateway o ms-listas-espera) mediante un interruptor para validar visualmente cómo responde el frontend ante fallas, mostrando estados degradados y fallbacks gráciles en tiempo real.
5.  **Diseño Visual Premium**: Interfaz moderna y adaptativa que incluye animaciones sutiles, transiciones fluidas, tipografía Plus Jakarta Sans y un **selector dinámico de temas Claro / Oscuro** basado en variables HSL puras.

---

## 📂 Estructura del Proyecto

El código fuente está rigurosamente organizado siguiendo principios de mantenibilidad y modularidad:

```
RedNorte-frontend/
├── dist/                     # Carpeta final de distribución (NPM Bundle generado en el build)
├── public/                   # Archivos estáticos públicos
├── src/
│   ├── components/           # Presenters: Componentes visuales puros y reactivos
│   │   ├── ListaEsperaTable.tsx  # Tabla de lista de espera (solo render y estados UI)
│   │   ├── CitasDashboard.tsx    # Portal del Paciente (solo render)
│   │   └── index.ts              # Exportador de componentes
│   ├── containers/           # Containers: Componentes inteligentes de estado y llamadas asíncronas
│   │   ├── ListaEsperaContainer.tsx  # Contenedor de estado para la lista de espera
│   │   ├── CitasDashboardContainer.tsx # Contenedor de estado para el portal de pacientes
│   │   └── index.ts              # Exportador de contenedores
│   ├── hooks/                # Lógica de negocio y llamadas a la API
│   │   └── useListasEspera.ts    # Manejo de estado asíncrono y motor de reasignación
│   ├── styles/               # Sistema de diseño con variables HSL
│   │   └── main.css              # Estilos premium CSS responsivos y temas claro/oscuro
│   ├── App.tsx               # Showcase de desarrollo local (Demo interactiva con Containers)
│   ├── index.ts              # Punto de entrada principal para exportaciones de la biblioteca NPM
│   └── main.tsx              # Inicialización local de React
├── package.json              # Configuración del paquete NPM (exports, scripts y dependencias)
├── vite.config.ts            # Compilación en Modo Librería y generación de tipos (.d.ts)
└── tsconfig.json             # Ajustes de tipado de TypeScript
```

---

## 🏗️ Patrón de Arquitectura: Container / Presenter

Para cumplir con las directrices de la evaluación, el frontend está estructurado estrictamente bajo el patrón **Container / Presenter** (componentes inteligentes/tontos). Esto permite una separación de responsabilidades clara y profesional:

- **Contenedores (`src/containers/`)**:
  - Son los componentes *Smart*. Tienen acceso a los custom hooks (`useListasEspera`) y realizan la orquestación de llamadas asíncronas hacia el BFF y la API.
  - Manejan los estados de carga específicos (`buscando`, `loadingCitas`, `procesando`) y el control local de errores de la API.
  - Inyectan datos y funciones de callback formateadas hacia los componentes visuales mediante props.
  - **Archivos**: [ListaEsperaContainer.tsx](file:///c:/Users/Angel/Documents/Duoc/Fullstack%20III/Ev3/Rednorte/RedNorte-frontend/src/containers/ListaEsperaContainer.tsx) y [CitasDashboardContainer.tsx](file:///c:/Users/Angel/Documents/Duoc/Fullstack%20III/Ev3/Rednorte/RedNorte-frontend/src/containers/CitasDashboardContainer.tsx).

- **Presentadores (`src/components/`)**:
  - Son los componentes *Dumb*. Su única función es pintar la interfaz basándose en las props recibidas y notificar interacciones del usuario mediante callbacks.
  - No hacen llamadas directas a hooks globales, no manejan bloques try-catch asíncronos para operaciones ni realizan peticiones HTTP.
  - Únicamente mantienen estados de UI visuales locales de interacción (como filtros de ordenamiento, términos de búsqueda o visualización modal).
  - **Archivos**: [ListaEsperaTable.tsx](file:///c:/Users/Angel/Documents/Duoc/Fullstack%20III/Ev3/Rednorte/RedNorte-frontend/src/components/ListaEsperaTable.tsx) y [CitasDashboard.tsx](file:///c:/Users/Angel/Documents/Duoc/Fullstack%20III/Ev3/Rednorte/RedNorte-frontend/src/components/CitasDashboard.tsx).

---

## 🛠️ Guía de Uso Local y Desarrollo

Sigue estos sencillos pasos para instalar, ejecutar y probar los componentes en aislamiento en tu máquina:

### 1. Requisitos Previos
Asegúrate de contar con **Node.js** (versión 18 o superior recomendada) y **npm** instalados.

### 2. Instalación de Dependencias
Abre tu terminal en la raíz de la carpeta `RedNorte-frontend` y ejecuta:
```bash
npm install
```
*Este comando descargará e instalará todas las dependencias necesarias de desarrollo y de interfaz (incluyendo `lucide-react` para iconos y `vite-plugin-dts` para el compilado de tipos).*

### 3. Ejecutar Entorno de Desarrollo Local
Para levantar el servidor local y visualizar la interfaz interactiva de componentes en tu navegador, ejecuta:
```bash
npm run dev
```
La consola te indicará el puerto local asignado (típicamente `http://localhost:5173`). Abre esa URL para interactuar en vivo con:
-   La tabla de administración de listas de espera.
-   El simulador de perfiles del portal de pacientes (BFF).
-   El simulador de caídas de conexión y logs de auditoría del motor de reasignaciones.
-   La alternancia del modo claro/oscuro en tiempo real.

---

## 📦 Compilación y Generación del Paquete NPM

Para compilar la biblioteca y prepararla para ser publicada en un registro NPM privado o distribuida de manera local, ejecuta:
```bash
npm run build
```

Una vez completado de forma exitosa, se creará el directorio `/dist` con la siguiente estructura lista para distribución:
*   `dist/rednorte-frontend.js`: El bundle empaquetado optimizado en formato **ES Modules** (`import`).
*   `dist/rednorte-frontend.umd.cjs`: El bundle de compatibilidad universal en formato **UMD** (`require`).
*   `dist/index.d.ts`: Archivo autogenerado con la definición de todos los tipos y declaraciones TypeScript de la biblioteca.
*   `dist/index.css`: Archivo CSS unificado y minificado con el sistema de diseño completo de RedNorte.

---

## 🧩 Ejemplos Prácticos de Consumo

Una vez compilado o publicado el paquete, cualquier desarrollador del equipo de RedNorte puede consumir la biblioteca en una aplicación externa de la siguiente forma:

### Importar Estilos
En el archivo de entrada de tu aplicación (ej: `main.jsx` o `index.js`):
```javascript
import '@rednorte/ui/dist/index.css';
```

### Usar el Hook de Lógica y los Componentes UI
En tu componente React:
```tsx
import { 
  ListaEsperaTable, 
  CitasDashboard, 
  useListasEspera 
} from '@rednorte/ui';

function DashboardHospital() {
  const { 
    atenciones, 
    pacientes, 
    reasignaciones, 
    actualizarEstadoAtencion, 
    cancelarYReasignar 
  } = useListasEspera();

  return (
    <div className="container">
      <h2>Panel Administrativo RedNorte</h2>
      
      {/* 1. Tabla de gestión de listas de espera */}
      <ListaEsperaTable 
        atenciones={atenciones}
        onActualizarEstado={actualizarEstadoAtencion}
        onCancelarYReasignar={cancelarYReasignar}
      />
      
      {/* 2. Portal BFF de Pacientes */}
      <CitasDashboard 
        pacientes={pacientes}
        atenciones={atenciones}
        reasignaciones={reasignaciones}
        onCancelarYReasignar={cancelarYReasignar}
        onActualizarEstado={actualizarEstadoAtencion}
      />
    </div>
  );
}
```

---

## 🛡️ Integración con Microservicios Reales
El hook `useListasEspera.ts` centraliza las mutaciones de datos del frontend. Para conectar esta biblioteca al API Gateway real (`http://localhost:8080`), basta con reescribir las funciones internas del hook (`registrarPaciente`, `registrarAtencion`, `cancelarYReasignar`, etc.) reemplazando el estado local de LocalStorage con peticiones HTTP asíncronas (`fetch` o `axios`) apuntando a las rutas del Gateway:
*   `/api/listas-espera/pacientes`
*   `/api/listas-espera/atenciones`
*   `/api/reasignacion/procesar/{id}`
*   `/api/portal-paciente/perfil`
