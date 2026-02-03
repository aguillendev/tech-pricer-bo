# Documentación Técnica - TechPricer 🛠️

Este documento describe la arquitectura, tecnologías y decisiones de diseño del proyecto **TechPricer**.

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza una arquitectura cliente-servidor desacoplada.

### Backend (`tech-pricer-be`)
- **Framework**: Spring Boot (Java).
- **Puerto**: 8080.
- **Función**: Manejo de lógica de negocio, persistencia (futura), endpoints de administración.
- *Nota actual*: Para prototipado rápido, parte de la lógica se encuentra simulada/mockeada en el cliente, pero preparada para migrar a endpoints REST reales.

### Frontend (`tech-pricer-bo`)
- **Framework**: React (Vite).
- **Lenguaje**: JavaScript / JSX.
- **Estilos**: Tailwind CSS + Lucide React (Iconos).
- **Gestión de Estado**:
  - `Context API`: Para manejo global de **Autenticación** (`AuthContext`) y **Configuración** (`ConfigContext`).
  - `Hooks` personalizados: `useProducts`, `useConfig`, `useAuth`.

---

## 🧩 Componentes Principales

### 1. Sistema de Configuración Global (`ConfigContext`)
Ubicación: `client/src/hooks/useConfig.jsx`

Gestiona las variables críticas del negocio:
- `dollarRate`: Cotización del dólar.
- `profitMargin`: Margen de ganancia (%).
- `lastDollarUpdate`: Timestamp de la última sincronización con la API externa.

**Integración con API Externa:**
- **Provider**: `dolarapi.com` (Endpoint: `/v1/dolares/oficial`).
- **Lógica de Actualización**:
  1. **Inicial**: Al cargar la app.
  2. **Automática**: `setInterval` cada 1 hora (3600000ms).
  3. **Trigger**: Al ejecutar una importación masiva (`refreshDollarRate`).

### 2. Autenticación (`AuthContext`)
Ubicación: `client/src/hooks/useAuth.jsx`

- Maneja el estado `isLoggedIn` y el objeto `user`.
- Persistencia actual: Memoria (se resetea al recargar).
- Proveedor de acceso seguro a rutas administrativas.

### 3. Parseo de Productos (`useProducts`)
Ubicación: `client/src/services/api.js` (Lógica de mocking/parseo)

El sistema de importación utiliza **Expresiones Regulares (Regex)** para interpretar texto no estructurado:
- **Categorías**: Detectadas por `^►\s*(.*)`
- **Productos**: Detectados por `^▪️\s*(.*)\s*-\s*\$\s*([\d.,]+)`
- **Manejo de errores**: Fallback a formato CSV básico.

---

## 🚀 Flujo de Datos

1. **Usuario Final**:
   - Accede a `/`.
   - `ProductsTable` consume `useConfig` para obtener `dollarRate`.
   - **Cálculo de Precio**:
     ```javascript
     CostoARS = PrecioUSD * dollarRate
     PrecioFinal = CostoARS * (1 + profitMargin / 100)
     ```
   - Solo se muestra `PrecioFinal`.

2. **Administrador**:
   - Accede a `/admin` (protegido).
   - Puede modificar `profitMargin` vía POST (actualmente simulado).
   - Al importar, el frontend fuerza un `fetch` a la API del dólar antes de procesar el texto para garantizar precios actualizados.

---

## ⚙️ Configuración y Ejecución

### Requisitos
- Node.js (v16+)
- Java JDK 17+ (para el backend)
- Maven

### Comandos
**Frontend**:
```bash
cd client
npm install
npm run dev
```

**Backend**:
```bash
mvn spring-boot:run
```

---

## 📦 Dependencias Clave (Frontend)
- `axios`: Cliente HTTP.
- `react-router-dom`: Enrutamiento.
- `clsx`: Utilidades de clases CSS condicionales.
- `lucide-react`: Iconografía.
- `tailwindcss`: Framework de estilos.

---
*Generado automáticamente por Antigravity Assistant*
