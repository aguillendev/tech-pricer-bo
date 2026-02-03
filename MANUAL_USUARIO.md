# Manual de Usuario - TechPricer 🚀

Bienvenido a **TechPricer**, la herramienta de cotización y gestión de precios para productos tecnológicos.

Este manual te guiará paso a paso parasacar el máximo provecho de la aplicación.

---

## 📋 Índice
1. [Vista Pública (Clientes)](#1-vista-pública-clientes)
2. [Acceso al Panel de Administración](#2-acceso-al-panel-de-administración)
3. [Gestión de Configuración](#3-gestión-de-configuración)
4. [Importación Masiva de Productos](#4-importación-masiva-de-productos)
5. [Consideraciones sobre la Cotización del Dólar](#5-consideraciones-sobre-la-cotización-del-dólar)

---

## 1. Vista Pública (Clientes)
Al ingresar a la aplicación, los usuarios ven la lista de productos disponibles con sus **Precios Finales en Pesos (ARS)**.

- **Buscador**: Utilizá la barra superior para filtrar productos por nombre o categoría.
- **Carrito**: (Funcionalidad visual) Permite ir seleccionando productos para armar un presupuesto.
- **Cotización**: En el encabezado superior derecho se muestra la cotización del dólar actual que se está utilizando para los cálculos. Si pasás el mouse por encima, verás la hora exacta de la última actualización.

> **Nota**: El cliente final SOLO ve el precio final. No ve costos ni márgenes de ganancia.

---

## 2. Acceso al Panel de Administración
Para gestionar precios y productos:

1. Hacé clic en el enlace **"Iniciar Sesión"** (candado 🔒) en la esquina superior derecha.
2. Ingresá tus credenciales.
   - *Credenciales por defecto (demo):* Contraseña `admin`.
3. Al ingresar, verás que el encabezado cambia y muestra un icono verde de administrador.

### Vista de Administrador en la Lista de Precios
Cuando estás logueado, la tabla de productos muestra información extra privilegiada:
- **Costo USD**: El precio base del producto en dólares.
- **Costo ARS**: El costo convertido a pesos según la cotización oficial.
- **Precio Final**: El precio de venta al público (Costo ARS + Ganancia).

---

## 3. Gestión de Configuración
Dentro del **Panel de Administración** (`/admin`), la primera pestaña es **Configuración**.

- **Porcentaje de Ganancia**: Definí el margen global que querés aplicar a todos los productos.
  - Ejemplo: Si ingresás `30`, un producto de $10 USD se cobrará como $13 USD (pasados a pesos).
- **Guardar Cambios**: Al guardar, todos los precios de la lista se recalculan automáticamente.

---

## 4. Importación Masiva de Productos
Esta es la funcionalidad principal para mantener tu lista actualizada.

1. Andá a la pestaña **"Importación Masiva"** en el panel de administración.
2. Copiá tu lista de precios desde Excel, WhatsApp o archivo de texto.
3. Pegala en el cuadro de texto. La app soporta formatos inteligentes que detectan categorías automáticamente.

**Formatos soportados:**
- **Categorías**: Líneas que empiezan con `►` (ej: `► COMPUTACIÓN`).
- **Productos**: Líneas que empiezan con `▪️` seguidas del nombre y precio.
  - Ejemplo: `▪️ Mouse Logitech - $15.50`
- **CSV Simple**: `Nombre, Precio, Categoría` (ej: `Mouse, 15.50, Periféricos`).

4. Hacé clic en **"Procesar e Importar"**.
   - El sistema cargará los productos.
   - **Automáticamente actualizará la cotización del dólar** para asegurar que los precios sean los del momento exacto.

---

## 5. Consideraciones sobre la Cotización del Dólar
El sistema está conectado directamente a la API de **DolarApi.com** (Cotización Oficial - Venta).

- **Actualización Automática**: El sistema busca la nueva cotización cada **1 hora**.
- **Al Importar**: Se fuerza una actualización inmediata de la cotización al cargar nuevos productos.
- **Tooltip**: Pasando el mouse sobre el precio del dólar en el encabezado, podés ver la hora exacta de la última verificación (Hora Argentina).

---
*TechPricer v1.0 - 2026*
