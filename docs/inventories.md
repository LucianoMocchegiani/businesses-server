# Core de Inventario para App Multi-Negocio (Kioscos)

## 1. Modelo de Productos

- **GlobalProduct:**  
  Productos universales, visibles para todos los negocios.  
  *Ejemplo:* Coca-Cola 500ml, Galletitas Oreo, etc.

- **BusinessProduct:**  
  Productos propios de un negocio.  
  Puede estar vinculado a un GlobalProduct (si es una variante) o ser totalmente independiente (producto exclusivo de ese negocio).

---

## 2. Inventario

- **Inventory:**  
  Siempre está ligado a un negocio (`business_id`).  
  Puede estar ligado a un `business_product_id` (producto propio) o a un `global_product_id` (producto global que el negocio adoptó directamente).

- **Regla:**  
  - Si el producto es global y el negocio lo usa tal cual, puedes crear un inventario con `global_product_id`.
  - Si el producto es propio (o una variante personalizada de un global), creas un `BusinessProduct` y el inventario apunta a `business_product_id`.

---

## 3. Flujo recomendado para kioscos

### a) Agregar producto al inventario

- El usuario busca en los productos globales.
  - Si existe, lo selecciona y se crea un registro en `Inventory` con `global_product_id` y su `business_id`.
  - Si no existe, crea un `BusinessProduct` y luego un registro en `Inventory` con `business_product_id` y su `business_id`.

### b) Visualización

- El inventario de un negocio se consulta por `business_id`.
- Para cada registro, puedes mostrar los datos del producto global o del producto propio según corresponda.

### c) Stock

- El stock se maneja siempre en la tabla `Inventory`, nunca en el producto.
- Los movimientos de stock (ventas, compras, ajustes) afectan el campo `stock_quantity_total` de `Inventory`.

---

## 4. Ventajas de este enfoque

- **Escalabilidad:** Cada negocio puede tener productos propios y/o globales.
- **Flexibilidad:** Un producto global puede ser personalizado (creando un `BusinessProduct` a partir de él).
- **Simplicidad:** El inventario siempre se consulta por negocio, y el producto puede ser global o propio.

---

## 5. Ejemplo de consulta de inventario

```typescript
// Obtener inventario de un negocio, mostrando datos del producto global o propio
const inventory = await prisma.inventory.findMany({
  where: { business_id: negocioId },
  include: {
    businessProduct: true,
    globalProduct: true,
  },
});
```

## 6. ¿Qué deberías evitar?

- No mezcles stock global con stock de negocio. El stock siempre es por negocio.
- No guardes stock en la tabla de productos, solo en Inventory.

## 7. ¿Qué podrías mejorar?
- Puedes agregar un campo type en Inventory para saber si es global o propio (opcional, ya que con los IDs nulos ya lo sabes).
- Puedes crear un endpoint para que un negocio "importe" un producto global y lo personalice (creando un BusinessProduct a partir de un GlobalProduct).

##  Resumen visual
```typescript
Business
  |
  |-- Inventory (business_id, global_product_id?) --> GlobalProduct
  |-- Inventory (business_id, business_product_id?) --> BusinessProduct
```