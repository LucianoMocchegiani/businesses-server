# Flujo de venta de un producto

## Buscar inventario existente

- Buscar en `Inventory` si ya existe un registro para ese `business_id` y el producto (`global_product_id` o `business_product_id`).
- Si **no existe**:
  - (No se puede vender, mostrar error o sugerir agregar el producto al inventario).
- Si **existe**:
  - Verificar que el stock (`stock_quantity_total`) sea suficiente para la venta.
  - Si el stock es insuficiente, mostrar error.

## Registrar la venta

- Crear un registro en `Sale` con los datos generales de la venta (fecha, negocio, usuario, etc.).
- Asignar el estado inicial de la venta, por ejemplo: `PENDING`.
- Por cada producto vendido, crear un registro en `SaleDetail` asociando el `inventory_id`, cantidad vendida, precio de venta, etc.

## Actualizar inventario

- Por cada producto vendido, descontar la cantidad correspondiente del campo `stock_quantity_total` en `Inventory`.

## Consultar el precio de venta vigente

- Consultar el precio de venta vigente en la tabla `InventoryPrice` para el `inventory_id` y la fecha de la venta.

## Manejo de estados de la venta

- El campo `status` en el modelo `Sale` puede tener los siguientes valores:
  - `PENDING`: La venta está registrada pero aún no se ha completado.
  - `COMPLETED`: La venta fue realizada y confirmada.
  - `CANCELED`: La venta fue anulada y, si corresponde, el stock puede ser restituido.

- El flujo típico es:
  1. Al crear la venta, el estado es `PENDING`.
  2. Cuando se confirma la venta, se cambia el estado a `COMPLETED`.
  3. Si la venta se anula, se cambia el estado a `CANCELED` y se puede revertir el movimiento de stock.

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

## Notas

- No se puede vender si no hay inventario o stock suficiente.
- El precio de venta puede ser histórico (varios registros en `InventoryPrice`).
- El stock total se actualiza en el inventario.
- Así puedes manejar ventas de productos globales y propios con la misma lógica.
- El estado de la venta permite controlar el ciclo de vida de la operación y facilita la gestión de anulaciones y auditoría.

---

## Cómo funciona el manejo de precios históricos

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

### Resumen

- **Nunca sobrescribas el precio anterior:** siempre crea un nuevo registro.
- **Consulta el precio vigente** según la fecha de la operación.
- Así puedes auditar y reportar correctamente.