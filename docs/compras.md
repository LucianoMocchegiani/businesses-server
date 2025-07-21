# Sistema de Compras - Backend (NestJS + Prisma)

## Índice
1. [Flujo de Negocio](#flujo-de-negocio)
2. [Arquitectura Backend](#arquitectura-backend)
3. [API Endpoints](#api-endpoints)
4. [Validaciones y Seguridad](#validaciones-y-seguridad)
5. [Manejo de Precios Históricos](#manejo-de-precios-históricos)
6. [Casos de Uso](#casos-de-uso)

---

## Flujo de Negocio

### 1. Creación de Compra
1. **Validación de Proveedor**: Verificar que el proveedor existe y pertenece al negocio
2. **Procesamiento de Productos**: Para cada producto en la compra:
   - Buscar inventario existente
   - Crear o actualizar inventario
   - Crear lote asociado
3. **Cálculo de Totales**: Sumar todos los detalles de la compra
4. **Transacción de Base de Datos**: Crear compra, detalles, inventario y lotes en una transacción

### 2. Visualización de Compra
1. **Validación de Pertenencia**: Verificar que la compra pertenece al negocio
2. **Carga de Datos Completos**: Incluir información de proveedor, productos y lotes
3. **Retorno de Datos**: Devolver estructura completa para el frontend

### 3. Cancelación de Compra
1. **Validación de Estado**: Verificar que la compra no esté ya cancelada
2. **Reversión de Inventario**: Restar cantidades del inventario
3. **Actualización de Lotes**: Ajustar cantidades en lotes existentes
4. **Cambio de Estado**: Marcar compra como cancelada

---

## Arquitectura Backend

### Estructura de Archivos
```
src/purchases/
├── purchases.controller.ts       # Endpoints REST
├── purchases.service.ts          # Lógica de negocio
├── purchases.module.ts           # Configuración del módulo
└── dto/
    ├── create-purchase.dto.ts    # DTO para creación
    ├── update-purchase.dto.ts    # DTO para actualización
    └── get-purchases.dto.ts      # DTO para consultas
```

### Controlador (PurchasesController)
**Archivo**: `src/purchases/purchases.controller.ts`

**Responsabilidades**:
- Definir endpoints REST
- Manejar headers de autenticación y negocio
- Validación de entrada con DTOs
- Manejo de errores HTTP

**Endpoints**:
- `GET /purchases` - Lista paginada
- `GET /purchases/:id` - Detalles completos
- `POST /purchases` - Crear compra
- `PUT /purchases/:id` - Actualizar compra
- `DELETE /purchases/:id` - Cancelar compra

### Servicio (PurchasesService)
**Archivo**: `src/purchases/purchases.service.ts`

**Responsabilidades**:
- Lógica de negocio de compras
- Transacciones de base de datos
- Validaciones de negocio
- Manejo de inventario y lotes

**Métodos Principales**:
- `getPurchasesByBusiness()` - Lista paginada
- `getPurchaseById()` - Detalles completos
- `createPurchase()` - Crear con validaciones
- `updatePurchase()` - Actualizar existente
- `cancelPurchase()` - Cancelar y revertir

---

## API Endpoints

### GET /purchases
**Descripción**: Lista paginada de compras del negocio

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `order_by` (opcional): Campo de ordenamiento
- `order_direction` (opcional): Dirección (asc/desc)
- `supplier_name` (opcional): Filtro por nombre de proveedor
- `status` (opcional): Filtro por estado
- `total_amount` (opcional): Filtro por monto total

**Respuesta**:
```json
{
  "data": [
    {
      "purchase_id": 1,
      "supplier_name": "Proveedor ABC",
      "total_amount": 1500.00,
      "status": "PENDING",
      "created_at": "2024-01-15T10:30:00Z",
      "purchaseDetails": []
    }
  ],
  "total": 25,
  "page": 1,
  "last_page": 3
}
```

### GET /purchases/:id
**Descripción**: Detalles completos de una compra específica

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Validaciones**:
- La compra debe existir
- La compra debe pertenecer al negocio especificado

**Respuesta**:
```json
{
  "purchase_id": 1,
  "supplier_id": 5,
  "supplier_name": "Proveedor ABC",
  "total_amount": 1500.00,
  "status": "PENDING",
  "created_at": "2024-01-15T10:30:00Z",
  "purchaseDetails": [
    {
      "purchase_detail_id": 1,
      "product_id": "PROD001",
      "product_name": "Producto A",
      "quantity": 10,
      "price": 150.00,
      "total_amount": 1500.00,
      "businessProduct": { ... },
      "globalProduct": { ... }
    }
  ]
}
```

### POST /purchases
**Descripción**: Crear nueva compra

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Body**:
```json
{
  "supplier_id": 5,
  "status": "PENDING",
  "purchaseDetails": [
    {
      "business_product_id": 1,
      "global_product_id": 2,
      "quantity": 10,
      "price": 150.00,
      "lot_number": "LOT001",
      "entry_date": 1705312200000,
      "expiration_date": 1736848200000
    }
  ]
}
```

**Validaciones**:
- Proveedor debe existir y pertenecer al negocio
- Al menos un detalle de producto
- Cantidades y precios válidos

**Efectos**:
- Crea registro en `Purchase`
- Crea registros en `PurchaseDetail`
- Actualiza o crea registros en `Inventory`
- Crea registros en `Lot`

### PUT /purchases/:id
**Descripción**: Actualizar compra existente

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Validaciones**:
- La compra debe existir y pertenecer al negocio
- Proveedor debe existir y pertenecer al negocio

**Efectos**:
- Actualiza datos de la compra
- Recalcula inventario
- Actualiza lotes

### DELETE /purchases/:id
**Descripción**: Cancelar compra

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Efectos**:
- Revierte inventario (resta cantidades)
- Actualiza lotes (resta cantidades)
- Cambia estado a 'CANCELED'

---

## Validaciones y Seguridad

### Headers Requeridos
- `x-business-id`: Identifica el negocio del usuario
- `Authorization`: Token de autenticación (manejado por middleware)

### Validaciones de Negocio
1. **Pertenencia al Negocio**: Todas las operaciones verifican que los datos pertenezcan al negocio del usuario
2. **Existencia de Proveedor**: Al crear/actualizar, verificar que el proveedor existe y pertenece al negocio
3. **Estado de Compra**: Validar que la compra no esté cancelada antes de modificaciones
4. **Integridad de Datos**: Validar cantidades, precios y fechas

### Transacciones de Base de Datos
- Todas las operaciones críticas usan transacciones
- Rollback automático en caso de error
- Consistencia garantizada entre compras, inventario y lotes

---

## Manejo de Precios Históricos

### 1. Cada vez que cambia el precio

Insertas un nuevo registro en `InventoryPrice` con:

- `inventory_id`
- `price_type` (por ejemplo: `'buy'`, `'sale'`, `'promo'`)
- `price`
- `valid_from` (fecha desde la que rige ese precio)
- (Opcional) `valid_to` (fecha hasta la que fue válido ese precio)

---

### 2. Consultar el precio vigente

Para saber el precio vigente en una fecha (por ejemplo, al registrar una venta o compra), consultas el precio más reciente cuyo `valid_from` sea menor o igual a esa fecha y, si usas `valid_to`, que la fecha esté dentro del rango.

```typescript
const precioVigente = await prisma.inventoryPrice.findFirst({
  where: {
    inventory_id,
    price_type: 'buy',
    valid_from: { lte: fechaOperacion },
    OR: [
      { valid_to: null },
      { valid_to: { gte: fechaOperacion } }
    ]
  },
  orderBy: { valid_from: 'desc' }
});
```

### 3. Ventajas

- Puedes calcular el costo real de ventas históricas.
- Puedes mostrar el historial de precios de cada producto.
- Permite manejar promociones y cambios de precio sin perder información.

---

## Casos de Uso

### 1. Compra con Proveedor Existente
1. Frontend envía datos con `supplier_id` válido
2. Backend valida que el proveedor pertenece al negocio
3. Se procesan los productos y se actualiza inventario
4. Se crean lotes para trazabilidad
5. Se retorna la compra creada

### 2. Compra sin Proveedor (Walk-in)
1. Frontend envía datos sin `supplier_id` o con `supplier_id: null`
2. Backend permite la compra sin validación de proveedor
3. Se procesa normalmente con inventario y lotes
4. Se retorna la compra creada

### 3. Visualización de Detalles
1. Frontend solicita detalles con `purchase_id`
2. Backend valida pertenencia al negocio
3. Se cargan datos completos incluyendo productos y lotes
4. Se retorna estructura completa para el frontend

### 4. Cancelación de Compra
1. Frontend solicita cancelación
2. Backend valida que la compra no esté ya cancelada
3. Se revierte el inventario automáticamente
4. Se actualizan los lotes correspondientes
5. Se cambia el estado a 'CANCELED'

---

## Ejemplo de lógica (prisma)

```typescript
// Buscar inventario
let inventory = await prisma.inventory.findFirst({
  where: { business_id, global_product_id }
});

if (!inventory) {
  // Crear inventario
  inventory = await prisma.inventory.create({
    data: {
      business_id,
      global_product_id,
      stock_quantity_total: cantidadComprada,
      // otros campos...
    }
  });
  // Crear precio de compra
  await prisma.inventoryPrice.create({
    data: {
      inventory_id: inventory.inventory_id,
      price_type: 'buy',
      price: precioCompra,
      valid_from: fechaCompra,
    }
  });
} else {
  // Actualizar stock
  await prisma.inventory.update({
    where: { inventory_id: inventory.inventory_id },
    data: { stock_quantity_total: { increment: cantidadComprada } }
  });
  // (Opcional) Actualizar o agregar precio de compra
  await prisma.inventoryPrice.create({
    data: {
      inventory_id: inventory.inventory_id,
      price_type: 'buy',
      price: precioCompra,
      valid_from: fechaCompra,
    }
  });
}

// Crear lote
await prisma.lot.create({
  data: {
    inventory_id: inventory.inventory_id,
    quantity: cantidadComprada,
    buy_price: precioCompra,
    expiration_date: fechaVencimiento,
    // otros campos...
  }
});

// Registrar compra y detalle
// ...
```

---

## Notas Técnicas

- Siempre que se compra, se crea un nuevo lote.
- El precio de compra puede ser histórico (varios registros en `InventoryPrice`).
- El stock total se actualiza en el inventario.
- Así puedes manejar productos globales y propios con la misma lógica.
- Todas las operaciones críticas usan transacciones de base de datos.
- Las validaciones aseguran que los datos pertenezcan al negocio correcto.
- El sistema maneja automáticamente los headers de autenticación y negocio.
- Los errores se manejan de forma consistente con códigos HTTP apropiados.

