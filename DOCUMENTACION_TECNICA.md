# Documentación Técnica - TechPricer 🛠️

Este documento describe la arquitectura, tecnologías, variables de entorno y decisiones de diseño del proyecto **TechPricer**.

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza una arquitectura cliente-servidor desacoplada.

```
┌─────────────────────┐        REST/JSON        ┌──────────────────────┐
│   Frontend (React)  │ ───────────────────────► │  Backend (Spring Boot)│
│   tech-pricer-bo    │                          │   tech-pricer-be     │
│   Vite + Tailwind   │ ◄─────────────────────── │   Puerto: 8080       │
└─────────────────────┘                          └──────────┬───────────┘
                                                            │
                                               ┌────────────┴────────────┐
                                               │                         │
                                               ▼                         ▼
                                    ┌──────────────────┐    ┌────────────────────┐
                                    │  PostgreSQL       │    │  dolarapi.com      │
                                    │  (techpricerdb)   │    │  (cotización BNA)  │
                                    └──────────────────┘    └────────────────────┘
```

> El frontend **solo** se comunica con el backend propio. Es el backend quien consulta `dolarapi.com` en tiempo real para obtener la cotización del dólar y la incluye en las respuestas. El frontend nunca llama directamente a APIs externas.

---

## 🔧 Backend (`tech-pricer-be`)

- **Framework**: Spring Boot 3.x (Java 17+)
- **Build**: Maven
- **Puerto por defecto**: `8080`
- **Base de datos**: PostgreSQL (JPA / Hibernate)

### Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| `GET` | `/api/public/products` | Público | Lista de productos con precio ARS calculado en tiempo real |
| `GET` | `/api/public/config` | Público | Margen de ganancia y cotización del dólar actual |
| `POST` | `/api/admin/import` | Admin | Importa productos desde texto plano |
| `POST` | `/api/admin/product` | Admin | Agrega un producto manual |
| `POST` | `/api/admin/config` | Admin | Actualiza configuración (margen de ganancia) |
| `DELETE` | `/api/admin/products/{id}` | Admin | Elimina un producto |
| `DELETE` | `/api/admin/products` | Admin | Elimina múltiples productos (body: `[id1, id2, ...]`) |
| `GET` | `/api/admin/rules` | Admin | Lista reglas de ganancia por tramo |
| `POST` | `/api/admin/rules` | Admin | Crea una regla de ganancia |
| `PUT` | `/api/admin/rules/{id}` | Admin | Actualiza una regla de ganancia |
| `DELETE` | `/api/admin/rules/{id}` | Admin | Elimina una regla de ganancia |

### Comportamiento ante falla de cotización

Si la API del dólar no está disponible, los endpoints que necesitan el tipo de cambio devuelven:

```
HTTP 503 Service Unavailable
{ "error": "No se pudo obtener la cotización del dólar..." }
```

---

## 🎨 Frontend (`tech-pricer-bo`)

- **Framework**: React 18 + Vite
- **Lenguaje**: JavaScript / JSX
- **Estilos**: Tailwind CSS + CSS personalizado (variables CSS, Art Deco theme)
- **Iconografía**: Lucide React

### Gestión de Estado

| Context | Hook | Responsabilidad |
|---------|------|-----------------|
| `ConfigContext` | `useConfig` | Cotización del dólar, margen de ganancia, error de cotización |
| `AuthContext` | `useAuth` | Estado de sesión del admin |

### Flujo de cotización del dólar

```
fetchConfig()
  └─► GET /api/public/config
          │  (El backend llama a dolarapi.com internamente)
          ├─ Éxito (200)  → { dollarRate, profitMargin }
          │                   Frontend usa dollarRate para mostrar precios
          └─ Error  (503) → { error: "No se pudo obtener la cotización..." }
                              Frontend muestra banner de error + botón Reintentar

Auto-refresh: cada 1 hora (setInterval sobre fetchConfig)
Manual: refreshDollarRate() → llama a fetchConfig() nuevamente
```

### Fórmula de precio

```
PrecioARS = PrecioUSD × dollarRate × (1 + markup / 100)
```

Donde `markup` se determina por las **reglas de ganancia por tramo** configuradas en el admin. Si ninguna regla aplica para el precio del producto, se usa el `profitPercentage` global de `GlobalConfig`.

---

## ⚙️ Variables de Entorno

### Backend — `tech-pricer-be`

Configuradas en `src/main/resources/application.properties` usando la sintaxis `${VARIABLE:valor_por_defecto}`.
En producción se definen como variables de entorno del sistema (Railway, Koyeb, etc.).

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_URL` | URL JDBC de conexión a PostgreSQL | `jdbc:postgresql://localhost:5432/techpricerdb` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `admin` |
| `PORT` | Puerto en que escucha el servidor | `8080` |
| `DOLAR_API_URL` | URL de la API de cotización del dólar | `https://dolarapi.com/v1/dolares/oficial` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (separados por `,`) | `http://localhost:5173,https://tech-pricer-bo.vercel.app` |
| `JPA_DDL_AUTO` | Modo DDL de Hibernate (`update`, `create-drop`, etc.) | `update` |
| `JPA_SHOW_SQL` | Mostrar SQL en logs (`true`/`false`) | `true` |

> ⚠️ **Importante**: Las variables `DB_PASSWORD` y `DB_URL` nunca deben quedar hardcodeadas en el código ni en archivos commiteados.

### Frontend — `tech-pricer-bo/client`

Configuradas en el archivo `.env` (no commitear) a partir de la plantilla `.env.example`.
Vite expone únicamente las variables con prefijo `VITE_`.

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base del backend (sin trailing slash) | `http://localhost:8080/api` |

**Uso en código:**
```javascript
// api.js
baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
```

**Archivos relacionados:**
- `.env` — valores locales (ignorado por git)
- `.env.example` — plantilla de referencia (sí se commitea)
- `.gitignore` — `.env` está explícitamente ignorado

---

## ⚙️ Configuración y Ejecución

### Requisitos

- Node.js v18+
- Java JDK 17+
- Maven 3.8+
- PostgreSQL 14+

### Setup inicial

**1. Base de datos** — crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE techpricerdb;
```

**2. Variables de entorno del backend** — crear un archivo `.env` o definir variables del sistema:
```bash
DB_URL=jdbc:postgresql://localhost:5432/techpricerdb
DB_USER=postgres
DB_PASSWORD=tu_password
```

**3. Variables de entorno del frontend:**
```bash
# client/.env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DOLAR_API_URL=https://dolarapi.com/v1/dolares/oficial
```

### Comandos de ejecución

**Backend:**
```bash
cd tech-pricer-be
mvn spring-boot:run
# O con variables explícitas:
DB_PASSWORD=tu_password mvn spring-boot:run
```

**Frontend:**
```bash
cd tech-pricer-bo/client
npm install
npm run dev
```

---

## 🧩 Servicios Clave (Backend)

### `DolarService`

Consulta la cotización del dólar en **tiempo real** en cada llamada (sin caché en base de datos).
- Si la API responde correctamente → devuelve el valor de `venta` (precio de venta del dólar oficial BNA).
- Si la API falla → lanza `DollarRateUnavailableException`, que el controller convierte en HTTP 503.
- La URL de la API se configura vía `DOLAR_API_URL`.

### `ProductService`

- `getAllProductsWithCalculatedPrice(Double dolarVenta)` — calcula el precio ARS de todos los productos usando el tipo de cambio provisto.
- `calculatePriceForProduct(Product, Double dolarVenta)` — ídem para un producto individual.
- El tipo de cambio se recibe como parámetro (nunca se llama a `DolarService` desde aquí).

### `ProfitRuleService`

Implementa el sistema de **reglas de ganancia por tramo de precio**:
- Cada regla define un rango `[minPriceUsd, maxPriceUsd]` y un `profitPercentage`.
- `resolveProfit(priceUsd, rules)` devuelve el porcentaje de la primera regla que aplica, o `null` si ninguna aplica (en ese caso se usa el global).

---

## 📦 Dependencias Clave

### Frontend
| Paquete | Uso |
|---------|-----|
| `axios` | Cliente HTTP para llamadas al backend |
| `react-router-dom` | Enrutamiento SPA |
| `clsx` | Clases CSS condicionales |
| `lucide-react` | Iconografía |
| `tailwindcss` | Framework de estilos |

### Backend
| Dependencia | Uso |
|-------------|-----|
| `spring-boot-starter-web` | API REST |
| `spring-boot-starter-data-jpa` | ORM con Hibernate |
| `postgresql` | Driver JDBC PostgreSQL |
| `lombok` | Reducción de boilerplate (getters, builders, etc.) |
| `jackson-databind` | Serialización JSON |

---

## 🔒 CORS

Configurado globalmente en `CorsConfig.java` (paquete `com.techpricer.config`).
Los orígenes permitidos se leen desde la variable de entorno `CORS_ALLOWED_ORIGINS` (valores separados por coma).
Se aplica a todos los endpoints bajo `/api/**`.

---

*Última actualización: 2026-02-24 — Antigravity Assistant*
