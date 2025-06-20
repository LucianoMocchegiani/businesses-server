# Flujo de compra de un producto global 

## Buscar inventario existente

- Buscar en `Inventory` si ya existe un registro para ese `business_id` y `global_product_id` (Oreo).
- Si **no existe**:
  - Crear un nuevo registro en `Inventory` con `business_id`, `global_product_id`, y el stock inicial (24).
  - Crear un registro en `InventoryPrice` con el precio de compra.
- Si **existe**:
  - Sumar la cantidad comprada al campo `stock_quantity_total` del inventario.
  - (Opcional) Actualizar el precio de compra en `InventoryPrice` si el precio cambió o guardar un nuevo registro de precio con la fecha de vigencia.

## Crear el lote

- Crear un registro en `Lot` asociado al `inventory_id`, con la cantidad (24), fecha de compra, vencimiento (si aplica), y precio de compra.

## Registrar la compra

- Crear un registro en `Purchase` y en `PurchaseDetail`, asociando el `inventory_id`, cantidad, precio, etc.

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

## Notas

- Siempre que se compra, se crea un nuevo lote.
- El precio de compra puede ser histórico (varios registros en `InventoryPrice`).
- El stock total se actualiza en el inventario.
- Así puedes manejar productos globales y propios con la misma lógica.

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

### Resumen

- **Nunca sobrescribas el precio anterior:** siempre crea un nuevo registro.
- **Consulta el precio vigente** según la fecha de la operación.
- Así puedes auditar y reportar correctamente.

