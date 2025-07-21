# Sistema de Ventas - Backend (NestJS + Prisma)

## Índice
1. [Flujo de Negocio](#flujo-de-negocio)
2. [Arquitectura Backend](#arquitectura-backend)
3. [API Endpoints](#api-endpoints)
4. [Validaciones y Seguridad](#validaciones-y-seguridad)
5. [Manejo de Precios Históricos](#manejo-de-precios-históricos)
6. [Casos de Uso](#casos-de-uso)

---

## Flujo de Negocio

### 1. Creación de Venta
1. **Validación de Cliente**: Verificar que el cliente existe y pertenece al negocio (opcional)
2. **Validación de Inventario**: Para cada producto en la venta:
   - Verificar que existe en inventario
   - Verificar stock suficiente
   - Consultar precio de venta vigente
3. **Cálculo de Totales**: Sumar todos los detalles de la venta
4. **Transacción de Base de Datos**: Crear venta, detalles y actualizar inventario en una transacción

### 2. Visualización de Venta
1. **Validación de Pertenencia**: Verificar que la venta pertenece al negocio
2. **Carga de Datos Completos**: Incluir información de cliente, productos y precios
3. **Retorno de Datos**: Devolver estructura completa para el frontend

### 3. Cancelación de Venta
1. **Validación de Estado**: Verificar que la venta no esté ya cancelada
2. **Reversión de Inventario**: Sumar cantidades al inventario
3. **Cambio de Estado**: Marcar venta como cancelada

---

## Arquitectura Backend

### Estructura de Archivos
```
src/sales/
├── sales.controller.ts           # Endpoints REST
├── sales.service.ts              # Lógica de negocio
├── sales.module.ts               # Configuración del módulo
└── dto/
    ├── create-sale.dto.ts        # DTO para creación
    ├── update-sale.dto.ts        # DTO para actualización
    └── get-sales.dto.ts          # DTO para consultas
```

### Controlador (SalesController)
**Archivo**: `src/sales/sales.controller.ts`

**Responsabilidades**:
- Definir endpoints REST
- Manejar headers de autenticación y negocio
- Validación de entrada con DTOs
- Manejo de errores HTTP

**Endpoints**:
- `GET /sales` - Lista paginada
- `GET /sales/:id` - Detalles completos
- `POST /sales` - Crear venta
- `PUT /sales/:id` - Actualizar venta
- `DELETE /sales/:id` - Cancelar venta

### Servicio (SalesService)
**Archivo**: `src/sales/sales.service.ts`

**Responsabilidades**:
- Lógica de negocio de ventas
- Transacciones de base de datos
- Validaciones de negocio
- Manejo de inventario y precios

**Métodos Principales**:
- `getSalesByBusiness()` - Lista paginada
- `getSaleById()` - Detalles completos
- `createSale()` - Crear con validaciones
- `updateSale()` - Actualizar existente
- `cancelSale()` - Cancelar y revertir

---

## API Endpoints

### GET /sales
**Descripción**: Lista paginada de ventas del negocio

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Query Parameters**:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `order_by` (opcional): Campo de ordenamiento
- `order_direction` (opcional): Dirección (asc/desc)
- `customer_name` (opcional): Filtro por nombre de cliente
- `status` (opcional): Filtro por estado
- `total_amount` (opcional): Filtro por monto total

**Respuesta**:
```json
{
  "data": [
    {
      "sale_id": 1,
      "customer_name": "Cliente ABC",
      "total_amount": 1500.00,
      "status": "COMPLETED",
      "created_at": "2024-01-15T10:30:00Z",
      "saleDetails": []
    }
  ],
  "total": 25,
  "page": 1,
  "last_page": 3
}
```

### GET /sales/:id
**Descripción**: Detalles completos de una venta específica

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Validaciones**:
- La venta debe existir
- La venta debe pertenecer al negocio especificado

**Respuesta**:
```json
{
  "sale_id": 1,
  "customer_id": 5,
  "customer_name": "Cliente ABC",
  "total_amount": 1500.00,
  "status": "COMPLETED",
  "created_at": "2024-01-15T10:30:00Z",
  "saleDetails": [
    {
      "sale_detail_id": 1,
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

### POST /sales
**Descripción**: Crear nueva venta

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Body**:
```json
{
  "customer_id": 5,
  "status": "PENDING",
  "saleDetails": [
    {
      "business_product_id": 1,
      "global_product_id": 2,
      "quantity": 10,
      "price": 150.00
    }
  ]
}
```

**Validaciones**:
- Cliente debe existir y pertenecer al negocio (si se proporciona)
- Al menos un detalle de producto
- Stock suficiente para cada producto
- Cantidades y precios válidos

**Efectos**:
- Crea registro en `Sale`
- Crea registros en `SaleDetail`
- Actualiza inventario (resta cantidades)
- Consulta precios vigentes

### PUT /sales/:id
**Descripción**: Actualizar venta existente

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Validaciones**:
- La venta debe existir y pertenecer al negocio
- Cliente debe existir y pertenecer al negocio (si se proporciona)

**Efectos**:
- Actualiza datos de la venta
- Recalcula inventario
- Actualiza precios

### DELETE /sales/:id
**Descripción**: Cancelar venta

**Headers**:
- `x-business-id` (requerido): ID del negocio

**Efectos**:
- Revierte inventario (suma cantidades)
- Cambia estado a 'CANCELED'

---

## Validaciones y Seguridad

### Headers Requeridos
- `x-business-id`: Identifica el negocio del usuario
- `Authorization`: Token de autenticación (manejado por middleware)

### Validaciones de Negocio
1. **Pertenencia al Negocio**: Todas las operaciones verifican que los datos pertenezcan al negocio del usuario
2. **Existencia de Cliente**: Al crear/actualizar, verificar que el cliente existe y pertenece al negocio (si se proporciona)
3. **Estado de Venta**: Validar que la venta no esté cancelada antes de modificaciones
4. **Stock Disponible**: Verificar stock suficiente antes de crear venta
5. **Integridad de Datos**: Validar cantidades, precios y fechas

### Transacciones de Base de Datos
- Todas las operaciones críticas usan transacciones
- Rollback automático en caso de error
- Consistencia garantizada entre ventas e inventario

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

Para saber el precio vigente en una fecha (por ejemplo, al registrar una venta), consultas el precio más reciente cuyo `valid_from` sea menor o igual a esa fecha y, si usas `valid_to`, que la fecha esté dentro del rango.

```typescript
const precioVigente = await prisma.inventoryPrice.findFirst({
  where: {
    inventory_id,
    price_type: 'sale',
    valid_from: { lte: fechaVenta },
    OR: [
      { valid_to: null },
      { valid_to: { gte: fechaVenta } }
    ]
  },
  orderBy: { valid_from: 'desc' }
});
```

### 3. Ventajas

- Puedes calcular el margen real de ventas históricas.
- Puedes mostrar el historial de precios de cada producto.
- Permite manejar promociones y cambios de precio sin perder información.

---

## Casos de Uso

### 1. Venta con Cliente Existente
1. Frontend envía datos con `customer_id` válido
2. Backend valida que el cliente pertenece al negocio
3. Se validan productos y stock disponible
4. Se consultan precios vigentes
5. Se crea la venta y se actualiza inventario
6. Se retorna la venta creada

### 2. Venta sin Cliente (Walk-in)
1. Frontend envía datos sin `customer_id` o con `customer_id: null`
2. Backend permite la venta sin validación de cliente
3. Se procesa normalmente con validación de inventario
4. Se retorna la venta creada

### 3. Visualización de Detalles
1. Frontend solicita detalles con `sale_id`
2. Backend valida pertenencia al negocio
3. Se cargan datos completos incluyendo productos y precios
4. Se retorna estructura completa para el frontend

### 4. Cancelación de Venta
1. Frontend solicita cancelación
2. Backend valida que la venta no esté ya cancelada
3. Se revierte el inventario automáticamente
4. Se cambia el estado a 'CANCELED'

---

## Ejemplo de lógica (prisma)

```typescript
// Buscar inventario
let inventory = await prisma.inventory.findFirst({
  where: { business_id, global_product_id }
});

if (!inventory || inventory.stock_quantity_total < cantidadVendida) {
  throw new Error('Stock insuficiente o producto no disponible en inventario');
}

// Consultar precio de venta vigente
const precioVenta = await prisma.inventoryPrice.findFirst({
  where: {
    inventory_id: inventory.inventory_id,
    price_type: 'sale',
    valid_from: { lte: fechaVenta },
    OR: [
      { valid_to: null },
      { valid_to: { gte: fechaVenta } }
    ]
  },
  orderBy: { valid_from: 'desc' }
});

// Registrar venta con estado inicial PENDING
const sale = await prisma.sale.create({
  data: {
    business_id,
    user_id,
    sale_date: fechaVenta,
    status: 'PENDING',
    // otros campos...
  }
});

// Registrar detalle de venta
await prisma.saleDetail.create({
  data: {
    sale_id: sale.sale_id,
    inventory_id: inventory.inventory_id,
    quantity: cantidadVendida,
    sale_price: precioVenta?.price ?? 0,
    // otros campos...
  }
});

// Actualizar inventario
await prisma.inventory.update({
  where: { inventory_id: inventory.inventory_id },
  data: { stock_quantity_total: { decrement: cantidadVendida } }
});

// Cambiar estado a COMPLETED cuando la venta se confirma
await prisma.sale.update({
  where: { sale_id: sale.sale_id },
  data: { status: 'COMPLETED' }
});

// Si la venta se anula, cambiar estado a CANCELED y revertir stock
await prisma.sale.update({
  where: { sale_id: sale.sale_id },
  data: { status: 'CANCELED' }
});
await prisma.inventory.update({
  where: { inventory_id: inventory.inventory_id },
  data: { stock_quantity_total: { increment: cantidadVendida } }
});
```

---

## Notas Técnicas

- No se puede vender si no hay inventario o stock suficiente.
- El precio de venta puede ser histórico (varios registros en `InventoryPrice`).
- El stock total se actualiza en el inventario.
- Así puedes manejar ventas de productos globales y propios con la misma lógica.
- El estado de la venta permite controlar el ciclo de vida de la operación y facilita la gestión de anulaciones y auditoría.
- Todas las operaciones críticas usan transacciones de base de datos.
- Las validaciones aseguran que los datos pertenezcan al negocio correcto.
- El sistema maneja automáticamente los headers de autenticación y negocio.
- Los errores se manejan de forma consistente con códigos HTTP apropiados.

---

### Resumen

- **Nunca sobrescribas el precio anterior:** siempre crea un nuevo registro.
- **Consulta el precio vigente** según la fecha de la operación.
- **Valida stock disponible** antes de procesar ventas.
- **Usa transacciones** para garantizar consistencia de datos.
- Así puedes auditar y reportar correctamente.