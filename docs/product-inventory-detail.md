# Método de Inventarios Detallados

## Descripción

Se ha agregado un nuevo método `getProductInventoryDetail` al servicio de productos que permite obtener información completa de inventarios, incluyendo lotes y precios para un producto específico.

## Endpoint

```
GET /products/:id/inventory
```

### Headers Requeridos
- `x-business-id`: ID del negocio

### Parámetros
- `id`: ID compuesto del producto (ej: `global-123` o `business-456`)

## Respuesta

```typescript
interface ProductInventoryDetail {
  product: ProductResult;           // Información básica del producto
  inventories: ProductInventory[];  // Lista de inventarios del producto
  total_stock: number;             // Stock total en todos los inventarios
  total_lots: number;              // Total de lotes
  active_prices: InventoryPrice[]; // Precios activos (no expirados)
}

interface ProductInventory {
  inventory_id: number;
  business_id: number;
  stock_quantity_total: number;
  created_at: Date;
  updated_at: Date;
  lots: InventoryLot[];      // Lotes del inventario
  prices: InventoryPrice[];  // Precios del inventario
}

interface InventoryLot {
  lot_id: number;
  lot_number?: string | null;
  entry_date?: Date | null;
  expiration_date?: Date | null;
  stock_quantity: number;
}

interface InventoryPrice {
  inventory_price_id: number;
  price_type: 'BUY' | 'SALE' | 'PROMO';
  price: number;
  valid_from: Date;
  valid_to?: Date | null;
  created_at: Date;
}
```

## Ejemplo de Respuesta

```json
{
  "product": {
    "id": "global-123",
    "name": "Producto Ejemplo",
    "barcode": "1234567890",
    "type": "global",
    "stock": {
      "quantity": 50,
      "low_stock_threshold": 5,
      "is_low_stock": false
    }
  },
  "inventories": [
    {
      "inventory_id": 1,
      "business_id": 1,
      "stock_quantity_total": 30,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "lots": [
        {
          "lot_id": 1,
          "lot_number": "LOT001",
          "entry_date": "2024-01-01T00:00:00Z",
          "expiration_date": "2025-01-01T00:00:00Z",
          "stock_quantity": 15
        },
        {
          "lot_id": 2,
          "lot_number": "LOT002",
          "entry_date": "2024-01-15T00:00:00Z",
          "expiration_date": "2025-01-15T00:00:00Z",
          "stock_quantity": 15
        }
      ],
      "prices": [
        {
          "inventory_price_id": 1,
          "price_type": "SALE",
          "price": 99.99,
          "valid_from": "2024-01-01T00:00:00Z",
          "valid_to": null,
          "created_at": "2024-01-01T00:00:00Z"
        },
        {
          "inventory_price_id": 2,
          "price_type": "BUY",
          "price": 50.00,
          "valid_from": "2024-01-01T00:00:00Z",
          "valid_to": null,
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    },
    {
      "inventory_id": 2,
      "business_id": 1,
      "stock_quantity_total": 20,
      "created_at": "2024-02-01T00:00:00Z",
      "updated_at": "2024-02-01T00:00:00Z",
      "lots": [
        {
          "lot_id": 3,
          "lot_number": "LOT003",
          "entry_date": "2024-02-01T00:00:00Z",
          "expiration_date": "2025-02-01T00:00:00Z",
          "stock_quantity": 20
        }
      ],
      "prices": [
        {
          "inventory_price_id": 3,
          "price_type": "PROMO",
          "price": 89.99,
          "valid_from": "2024-02-01T00:00:00Z",
          "valid_to": "2024-02-28T23:59:59Z",
          "created_at": "2024-02-01T00:00:00Z"
        }
      ]
    }
  ],
  "total_stock": 50,
  "total_lots": 3,
  "active_prices": [
    {
      "inventory_price_id": 1,
      "price_type": "SALE",
      "price": 99.99,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_to": null,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "inventory_price_id": 2,
      "price_type": "BUY",
      "price": 50.00,
      "valid_from": "2024-01-01T00:00:00Z",
      "valid_to": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Casos de Uso

### 1. Gestión de Inventarios
```javascript
// Obtener inventarios detallados para gestión
const inventoryDetail = await productService.getInventoryDetail('global-123');
console.log(`Stock total: ${inventoryDetail.total_stock}`);
console.log(`Lotes: ${inventoryDetail.total_lots}`);
```

### 2. Control de Vencimientos
```javascript
const inventoryDetail = await productService.getInventoryDetail('business-456');

// Verificar lotes próximos a vencer
const expiringLots = inventoryDetail.inventories.flatMap(inv => 
  inv.lots.filter(lot => {
    if (!lot.expiration_date) return false;
    const daysToExpire = (new Date(lot.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysToExpire <= 30; // Próximos a vencer en 30 días
  })
);
```

### 3. Análisis de Precios
```javascript
const inventoryDetail = await productService.getInventoryDetail('global-123');

// Obtener precios por tipo
const salePrices = inventoryDetail.active_prices.filter(p => p.price_type === 'SALE');
const buyPrices = inventoryDetail.active_prices.filter(p => p.price_type === 'BUY');
const promoPrices = inventoryDetail.active_prices.filter(p => p.price_type === 'PROMO');
```

### 4. Rastreabilidad por Lotes
```javascript
const inventoryDetail = await productService.getInventoryDetail('business-456');

// Obtener información de un lote específico
const lot = inventoryDetail.inventories
  .flatMap(inv => inv.lots)
  .find(lot => lot.lot_number === 'LOT001');

if (lot) {
  console.log(`Lote ${lot.lot_number}:`);
  console.log(`Stock: ${lot.stock_quantity}`);
  console.log(`Fecha de entrada: ${lot.entry_date}`);
  console.log(`Fecha de vencimiento: ${lot.expiration_date}`);
}
```

## Ventajas

1. **Información Completa**: Un solo endpoint proporciona toda la información de inventarios
2. **Trazabilidad**: Control completo de lotes y vencimientos
3. **Gestión de Precios**: Múltiples precios por inventario con validez temporal
4. **Flexibilidad**: Funciona tanto para productos globales como de negocio
5. **Optimizado**: Include solo los datos necesarios con joins eficientes

## Integración Frontend

```typescript
// En el productService.ts
getInventoryDetail: async (productId: string): Promise<ProductInventoryDetail> => {
  return apiService.get<ProductInventoryDetail>(`/products/${productId}/inventory`);
},

// Uso en componentes
const handleViewInventory = async (productId: string) => {
  try {
    const detail = await productService.getInventoryDetail(productId);
    setInventoryData(detail);
  } catch (error) {
    console.error('Error al cargar inventarios:', error);
  }
};
```

Este método proporciona una visión completa y detallada de los inventarios, perfecta para pantallas de gestión de stock, control de vencimientos y análisis de precios.
