# Manual de Usuario - TechPricer 🚀

Bienvenido a **TechPricer**, la herramienta de cotización y gestión de precios para productos tecnológicos.

Este manual te guiará paso a paso para sacar el máximo provecho de la aplicación.

---

## 📋 Índice

1. [Vista Pública (Clientes)](#1-vista-pública-clientes)
2. [Armar un Presupuesto (Carrito)](#2-armar-un-presupuesto-carrito)
3. [Acceso al Panel de Administración](#3-acceso-al-panel-de-administración)
4. [Vista de Administrador en la Tabla de Productos](#4-vista-de-administrador-en-la-tabla-de-productos)
5. [Gestión de Configuración](#5-gestión-de-configuración)
6. [Reglas de Ganancia por Tramos](#6-reglas-de-ganancia-por-tramos)
7. [Importación Masiva de Productos](#7-importación-masiva-de-productos)
8. [Agregar un Producto Individual](#8-agregar-un-producto-individual)
9. [Eliminar Productos](#9-eliminar-productos)
10. [Cotización del Dólar](#10-cotización-del-dólar)

---

## 1. Vista Pública (Clientes)

Al ingresar a la aplicación, los usuarios ven la lista completa de productos disponibles con sus **Precios Finales en Pesos (ARS)**.

- **Buscador**: Filtrá productos por nombre o categoría usando la barra superior.
- **Filtro por categoría**: Usá el desplegable para ver solo los productos de una categoría.
- **Precio**: Se muestra el precio final de venta en ARS. No se exponen costos ni márgenes.

> **Nota**: El cliente final **solo** ve el precio final de venta. Los costos en USD/ARS y el porcentaje de ganancia son información exclusiva del administrador.

### ⚠️ Error de cotización

Si el sistema no puede obtener la cotización del dólar en ese momento, verás un **banner de advertencia** en color amarillo con el mensaje:

> *"No se puede calcular precios en ARS"*

Podés hacer clic en el botón **Reintentar** para volver a intentar obtener la cotización.

---

## 2. Armar un Presupuesto (Carrito)

1. En la tabla de productos, hacé clic en el ícono **`+`** (o el carrito) a la derecha de cada producto para agregarlo al presupuesto.
2. El panel de **Carrito** aparece a la derecha (o debajo en móvil) y muestra el subtotal y total en ARS.
3. Podés quitar ítems del carrito con el ícono de eliminación en la lista del carrito.
4. Al terminar, hacé clic en **Exportar** para generar el presupuesto.

---

## 3. Acceso al Panel de Administración

Para acceder al panel de administración:

1. En el menú lateral izquierdo, hacé clic en **Configuración** (ícono de engranaje) o ingresá directamente a `/admin`.
2. Ingresá tus credenciales:
   - Contraseña: `admin` *(por defecto en modo demo)*
3. Al autenticarte correctamente serás **redirigido a la vista de productos** con los privilegios de administrador activos.

Para cerrar sesión, hacé clic en **Cerrar Sesión** en la parte inferior del menú lateral.

---

## 4. Vista de Administrador en la Tabla de Productos

Cuando estás logueado, la tabla muestra información adicional exclusiva del administrador:

| Columna | Descripción |
|---------|-------------|
| **☐** | Casilla de selección para eliminar en lote |
| **Producto** | Nombre y categoría |
| **Costo USD** | Precio base del producto en dólares |
| **Costo ARS** | Costo convertido a pesos según la cotización oficial del momento |
| **Ganancia** | Porcentaje de ganancia aplicado al producto (badge ambar `+35.0%`) |
| **Precio Final** | Precio de venta al público = Costo ARS × (1 + Ganancia%) |
| **Acción** | Botón para agregar al carrito |

También se muestra en la barra superior:
- Badge **"Vista Admin"** en azul.
- Cotización del dólar vigente en ese momento.

---

## 5. Gestión de Configuración

Dentro del **Panel de Administración** (`/admin`), encontrás la pestaña de **Configuración**:

- **Porcentaje de Ganancia Global**: Margen que se aplica a los productos cuando ninguna regla de tramo aplica.
  - Ejemplo: Si ingresás `30`, un producto de USD 100 se precio como USD 100 × cotización × 1,30.
- Al guardar, los cambios afectan **todos los productos que no tengan una regla por tramo específica**.

---

## 6. Reglas de Ganancia por Tramos

El sistema permite definir márgenes de ganancia diferenciados según el rango de precio del producto (en USD). Esto reemplaza al porcentaje global para esos productos.

### ¿Cómo funciona?

Cada regla define:
- **Precio mínimo (USD)**: Desde qué precio aplica.
- **Precio máximo (USD)**: Hasta qué precio aplica.
- **% Ganancia**: El margen a aplicar para ese tramo.

**Ejemplo de configuración por tramos:**

| Desde | Hasta | Ganancia |
|-------|-------|----------|
| $0 | $100 | 35% |
| $100 | $500 | 30% |
| $500 | $2000 | 25% |

Si un producto cuesta USD 350, le aplica el 30% (cae en el segundo tramo).
Si ninguna regla aplica al precio del producto, se usa el **porcentaje de ganancia global**.

### Gestionar reglas

En la pestaña **Reglas de Ganancia** dentro de `/admin`:

- **Agregar regla**: Completá los campos de rango y porcentaje y hacé clic en **Guardar Regla**.
- **Editar regla**: Hacé clic en el ícono de lápiz ✏️ sobre la regla que querés modificar.
- **Eliminar regla**: Hacé clic en el ícono de papelera 🗑️. Se pedirá confirmación.

> Las reglas son **complementarias**: el precio del producto determina cuál regla aplica. Verificá que los rangos no se superpongan para evitar ambigüedades.

---

## 7. Importación Masiva de Productos

Esta es la funcionalidad principal para mantener la lista de productos actualizada de forma rápida.

1. Desde la vista de productos, hacé clic en el botón **Agregar** (+) en la barra de búsqueda.
2. En el modal que se abre, seleccioná la pestaña **Importación Masiva**.
3. Copiá tu lista de precios desde Excel, WhatsApp o archivo de texto y pegala en el cuadro.
4. Hacé clic en **Importar Lista**.

### Formatos soportados

| Formato | Ejemplo |
|---------|---------|
| **Categoría** | `► COMPUTACIÓN` |
| **Producto** | `▪️ Mouse Logitech - $15.50` |
| **CSV simple** | `Mouse Logitech, 15.50, Periféricos` |

> La importación **reemplaza toda la lista** de productos existente. Asegurate de incluir todos los productos que querés tener activos.

---

## 8. Agregar un Producto Individual

Para agregar un solo producto sin necesidad de importar toda la lista:

1. Hacé clic en el botón **Agregar** (+) en la barra.
2. En el modal, seleccioná la pestaña **Producto Individual**.
3. Completá los campos: Nombre, Precio en USD y Categoría.
4. Hacé clic en **Guardar Producto**.

El producto se agrega a la lista existente sin reemplazar los demás.

---

## 9. Eliminar Productos

### Eliminación individual
Hacé clic en la **casilla de selección** (☐) de la fila del producto a eliminar, luego en el botón **Eliminar seleccionados** que aparece en la barra.

### Eliminación en lote
1. Seleccioná varios productos con sus casillas (o usá el checkbox del encabezado para seleccionar todos los filtrados).
2. Hacé clic en **Eliminar seleccionados**.
3. Confirmá la acción en el modal de confirmación.

> ⚠️ **Esta acción no se puede deshacer.**

---

## 10. Cotización del Dólar

TechPricer obtiene la cotización del **Dólar Oficial BNA (valor venta)** a través de [dolarapi.com](https://dolarapi.com).

| Momento | Qué ocurre |
|---------|-----------|
| **Al cargar la app** | Se obtiene la cotización desde el servidor |
| **Cada 1 hora** | Actualización automática en segundo plano |
| **Al importar productos** | Se fuerza una actualización para garantizar precios vigentes |
| **Botón Reintentar** | Actualización manual si hubo un error de conexión |

> La cotización **nunca se guarda en la base de datos**. Se consulta en tiempo real en cada operación que necesita calcular precios en ARS. Si la API no responde, los precios en ARS no pueden calcularse y se muestra un error descriptivo.

---

*TechPricer — Última actualización: 2026-02-25*
