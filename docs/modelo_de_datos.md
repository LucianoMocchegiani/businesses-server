# Documentación del Modelo de Datos (`schema.prisma`)

## General

- **ORM:** Prisma
- **Base de datos:** PostgreSQL
- **Generador:** Prisma Client JS

---

## Modelos principales

### User

Representa a los usuarios del sistema (dueños, empleados, etc.).

- **Relaciones:**
  - Puede ser dueño de varios negocios (`Business`).
  - Puede ser creador de productos personalizados (`BusinessProduct`).
  - Puede estar vinculado como personal (`Personnel`).
  - Puede tener múltiples perfiles de acceso (`ProfileUser`).

---

### Business

Representa un negocio o empresa.

- **Relaciones:**
  - Tiene un dueño (`User`).
  - Puede tener personal, perfiles, clientes, proveedores, ventas, compras, productos personalizados e inventarios.

---

### Brand

Marca de productos globales.

- **Relaciones:**
  - Puede tener múltiples productos globales (`GlobalProduct`).

---

### GlobalProduct

Producto genérico, no personalizado para un negocio.

- **Relaciones:**
  - Pertenece a una marca (`Brand`).
  - Puede estar en inventarios, categorías, ventas y compras.
  - Relación polimórfica con detalles de venta y compra.

---

### BusinessProduct

Producto personalizado para un negocio.

- **Relaciones:**
  - Pertenece a un negocio y puede tener un creador (`User`).
  - Puede estar en inventarios, categorías, ventas y compras.
  - Relación polimórfica con detalles de venta y compra.

---

### Inventory

Inventario de productos, puede ser global o personalizado.

- **Relaciones:**
  - Pertenece a un negocio.
  - Puede estar vinculado a un producto global o personalizado.
  - Tiene lotes y precios históricos.

---

### InventoryPrice

Historial de precios de inventario.

- **Relaciones:**
  - Pertenece a un inventario.

---

### Lot

Lote de inventario, útil para trazabilidad y vencimientos.

- **Relaciones:**
  - Pertenece a un inventario.

---

### Category & ProductCategory

Permiten categorizar productos globales o personalizados.

- **Relaciones:**
  - `Category` agrupa varias relaciones `ProductCategory`.
  - `ProductCategory` puede asociar un producto global o personalizado a una categoría.

---

### Personnel

Personal de un negocio.

- **Relaciones:**
  - Pertenece a un negocio.
  - Puede estar vinculado a un usuario del sistema.

---

### Profile, ProfileUser, Permission, Service

Sistema de roles y permisos.

- **Profile:** Perfil de acceso para un negocio.
- **ProfileUser:** Relaciona usuarios con perfiles.
- **Permission:** Permisos específicos para un perfil y servicio.
- **Service:** Funcionalidades del sistema.

---

### Customer & Supplier

Clientes y proveedores de un negocio.

- **Relaciones:**
  - Pertenecen a un negocio.
  - Relacionados con ventas (`Sale`) y compras (`Purchase`).

---

### Sale & SaleDetail

Ventas realizadas por un negocio.

- **Relaciones:**
  - `Sale` pertenece a un negocio y puede tener un cliente.
  - `SaleDetail` puede estar vinculado a un producto global o personalizado (relación polimórfica).

---

### Purchase & PurchaseDetail

Compras realizadas por un negocio.

- **Relaciones:**
  - `Purchase` pertenece a un negocio y puede tener un proveedor.
  - `PurchaseDetail` puede estar vinculado a un producto global o personalizado (relación polimórfica).

---

### SystemSetting

Configuraciones generales del sistema.

---

## Enums

- **PriceType:** Tipos de precio (compra, venta, promoción).
- **SaleStatus / PurchaseStatus:** Estado de ventas y compras.

---

## Relaciones polimórficas

- **SaleDetail** y **PurchaseDetail** pueden estar vinculados a un `BusinessProduct` o un `GlobalProduct`.
  Esto permite registrar ventas y compras tanto de productos personalizados como globales.

---

## Notas importantes

- **Relaciones inversas:** Todas las relaciones tienen su contraparte definida para cumplir con los requisitos de Prisma.
- **Campos opcionales:** Muchos campos de claves foráneas son opcionales para permitir flexibilidad en los registros.
- **Nombres de relaciones:** Se usan nombres explícitos en relaciones polimórficas