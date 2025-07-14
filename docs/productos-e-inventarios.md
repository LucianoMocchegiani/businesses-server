# Gestión de Productos e Inventarios - Business Admin System

## Tabla de Contenidos
- [Introducción](#introducción)
- [Arquitectura de Productos](#arquitectura-de-productos)
- [Sistema de Inventarios](#sistema-de-inventarios)
- [Módulo Unificado de Productos](#módulo-unificado-de-productos)
- [Sistema de Lotes y Trazabilidad](#sistema-de-lotes-y-trazabilidad)
- [Precios y Gestión Comercial](#precios-y-gestión-comercial)
- [Endpoints y API](#endpoints-y-api)
- [Flujos de Trabajo](#flujos-de-trabajo)
- [Ejemplos de Implementación](#ejemplos-de-implementación)

## Introducción

El sistema de gestión de productos e inventarios de Business Admin está diseñado para manejar la complejidad de un entorno multi-negocio donde cada comercio puede tener productos globales (catálogo universal) y productos específicos del negocio, con control completo de inventarios, lotes y precios.

### Características Principales
- **Productos Híbridos**: Combinación de catálogo global y productos específicos
- **Inventario por Negocio**: Stock independiente para cada comercio
- **Trazabilidad Completa**: Control de lotes desde compra hasta venta
- **Múltiples Precios**: Diferentes tipos de precio con validez temporal
- **API Unificada**: Un solo endpoint para todos los tipos de productos

## Arquitectura de Productos

### Tipos de Productos

#### 1. **Productos Globales** (`GlobalProduct`)
Productos universales disponibles para todos los negocios:
- **Ejemplos**: Coca-Cola 500ml, Oreo Original, Marlboro Box
- **Características**: 
  - Información estandarizada (nombre, código de barras, marca)
  - Disponible para cualquier negocio
  - Precio de referencia opcional
  - Categorización global

#### 2. **Productos del Negocio** (`BusinessProduct`)
Productos específicos de cada comercio:
- **Ejemplos**: Empanadas caseras, servicio de fotocopias, producto artesanal
- **Características**:
  - Completamente personalizable
  - Exclusivo del negocio
  - Puede derivar de un producto global (personalización)
  - Precios específicos del negocio

### Estructura de Datos

```typescript
// Producto Global
interface GlobalProduct {
  product_id: number;
  product_name: string;
  product_description?: string;
  product_code?: string;        // Código de barras universal
  brand_id?: number;
  category_id?: number;
  suggested_price?: number;     // Precio sugerido
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Producto del Negocio
interface BusinessProduct {
  business_product_id: number;
  business_id: number;          // Negocio propietario
  product_name: string;
  product_description?: string;
  product_code?: string;        // Código interno del negocio
  category_id?: number;
  price?: number;               // Precio del negocio
  global_product_id?: number;   // Referencia a producto global (opcional)
  created_by?: number;          // Usuario creador
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

## Sistema de Inventarios

### Principios del Inventario

1. **Stock por Negocio**: Cada inventario pertenece a un negocio específico
2. **Productos Híbridos**: Un inventario puede referenciar producto global O del negocio
3. **No Stock en Productos**: El stock se almacena solo en `Inventory`, nunca en las tablas de productos
4. **Trazabilidad**: Cada inventario puede tener múltiples lotes

### Modelo de Inventario

```typescript
interface Inventory {
  inventory_id: number;
  business_id: number;                    // Siempre requerido
  
  // Referencia a producto (uno de los dos)
  global_product_id?: number;            // Para productos globales
  business_product_id?: number;          // Para productos del negocio
  
  // Stock y control
  stock_quantity_total: number;          // Stock total actual
  low_stock_threshold?: number;          // Umbral de stock bajo
  
  // Fechas
  created_at: Date;
  updated_at: Date;
  
  // Relaciones
  lots: Lot[];                          // Lotes del inventario
  prices: InventoryPrice[];             // Precios del inventario
}
```

### Reglas de Negocio para Inventarios

1. **Un producto global** → Un negocio lo adopta tal cual → `Inventory` con `global_product_id`
2. **Un producto personalizado** → El negocio crea su variante → `BusinessProduct` + `Inventory` con `business_product_id`
3. **Stock siempre por negocio**: Cada `Inventory` pertenece a un `business_id`
4. **Movimientos de stock**: Solo se modifican a través de ventas, compras o ajustes

## Módulo Unificado de Productos

### API Unificada

El módulo `/products` combina productos globales y del negocio en una sola API:

#### Sistema de ID Compuesto
- **Productos Globales**: `global-123` (donde 123 es el `product_id`)
- **Productos del Negocio**: `business-456` (donde 456 es el `business_product_id`)

#### Respuesta Normalizada

```typescript
interface ProductResult {
  id: string;                    // ID compuesto
  name: string;                  // Nombre del producto
  description?: string;          // Descripción
  barcode?: string;             // Código de barras
  price?: number;               // Precio (global o del negocio)
  category?: string;            // Nombre de la categoría
  is_active: boolean;           // Estado activo
  type: 'global' | 'business';  // Tipo de producto
  created_at: Date;
  updated_at: Date;
  
  // Información de stock (cuando se incluye)
  stock?: {
    quantity: number;
    low_stock_threshold: number;
    is_low_stock: boolean;
  };
  
  // Campos específicos por tipo
  global_product_id?: number;    // Solo productos globales
  business_product_id?: number;  // Solo productos del negocio
  business_id?: number;          // Solo productos del negocio
}
```

### Mapeo de Campos

#### Productos Globales → ProductResult
```typescript
{
  id: `global-${product_id}`,
  name: product_name,
  description: product_description,
  barcode: product_code,
  price: suggested_price,
  type: 'global',
  global_product_id: product_id
}
```

#### Productos del Negocio → ProductResult
```typescript
{
  id: `business-${business_product_id}`,
  name: product_name,
  description: product_description,
  barcode: product_code,
  price: price,
  type: 'business',
  business_product_id: business_product_id,
  business_id: business_id
}
```

## Sistema de Lotes y Trazabilidad

### Gestión de Lotes

Cada inventario puede tener múltiples lotes para control de:
- **Fechas de vencimiento**
- **Trazabilidad de origen**
- **Control de calidad**
- **Rotación FIFO/LIFO**

```typescript
interface Lot {
  lot_id: number;
  inventory_id: number;          // Inventario al que pertenece
  lot_number?: string;           // Número de lote del proveedor
  entry_date?: Date;             // Fecha de ingreso
  expiration_date?: Date;        // Fecha de vencimiento
  stock_quantity: number;        // Stock disponible en este lote
  created_at: Date;
  updated_at: Date;
}
```

### Casos de Uso de Lotes

1. **Productos Perecederos**: Control de vencimientos
2. **Trazabilidad**: Identificar origen en caso de problemas
3. **Rotación de Stock**: FIFO automático
4. **Auditorías**: Historial completo de movimientos

## Precios y Gestión Comercial

### Sistema de Precios Múltiples

Cada inventario puede tener diferentes tipos de precios:

```typescript
interface InventoryPrice {
  inventory_price_id: number;
  inventory_id: number;
  price_type: 'BUY' | 'SALE' | 'PROMO';  // Tipo de precio
  price_value: number;                    // Valor del precio
  valid_from?: Date;                      // Válido desde
  valid_until?: Date;                     // Válido hasta
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Tipos de Precios

1. **BUY (Compra)**: Costo de adquisición del producto
2. **SALE (Venta)**: Precio de venta al público
3. **PROMO (Promoción)**: Precio promocional temporal

### Lógica de Precios Activos

```typescript
// Obtener precios activos (no expirados)
const activePrices = prices.filter(price => 
  price.is_active && 
  (!price.valid_until || price.valid_until > new Date())
);
```

## Endpoints y API

### Endpoints Principales

#### 1. **GET /products**
Obtener productos unificados con filtros y paginación

**Headers requeridos:**
- `x-business-id`: ID del negocio

**Query Parameters:**
```typescript
interface GetProductsQuery {
  // Paginación
  page?: number;                 // Página actual (default: 1)
  limit?: number;                // Elementos por página (default: 50)
  
  // Filtros de búsqueda
  name?: string;                 // Buscar por nombre
  barcode?: string;              // Buscar por código de barras
  category?: string;             // Filtrar por categoría
  is_active?: boolean;           // Filtrar por estado activo
  
  // Filtros de tipo
  include_global?: boolean;      // Incluir productos globales (default: true)
  include_business?: boolean;    // Incluir productos del negocio (default: true)
  
  // Filtros de stock
  include_stock?: boolean;       // Incluir información de stock (default: true)
  only_low_stock?: boolean;      // Solo productos con stock bajo (default: false)
  only_with_inventory?: boolean; // Solo productos con inventario (default: false)
  
  // Ordenamiento
  order_by?: string;             // Campo para ordenar (default: 'created_at')
  order_direction?: 'asc' | 'desc'; // Dirección de orden (default: 'desc')
}
```

**Respuesta:**
```typescript
interface ProductsResponse {
  data: ProductResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    globalProducts: number;      // Cantidad de productos globales
    businessProducts: number;    // Cantidad de productos del negocio
  };
}
```

#### 2. **GET /products/:id**
Obtener producto específico por ID compuesto

**Parámetros:**
- `id`: ID compuesto (`global-123` o `business-456`)

**Headers opcionales:**
- `x-business-id`: Para incluir información de stock

#### 3. **GET /products/:id/inventory**
Obtener información detallada de inventarios de un producto

**Headers requeridos:**
- `x-business-id`: ID del negocio

**Respuesta:**
```typescript
interface ProductInventoryDetail {
  product: ProductResult;           // Información básica del producto
  inventories: ProductInventory[];  // Lista de inventarios
  total_stock: number;             // Stock total
  total_lots: number;              // Total de lotes
  active_prices: InventoryPrice[]; // Precios activos
}

interface ProductInventory {
  inventory_id: number;
  business_id: number;
  stock_quantity_total: number;
  created_at: Date;
  updated_at: Date;
  lots: InventoryLot[];           // Lotes del inventario
  prices: InventoryPrice[];       // Precios del inventario
}
```

#### 4. **GET /products/reports/low-stock**
Obtener productos con stock bajo

**Headers requeridos:**
- `x-business-id`: ID del negocio

**Lógica:** Productos donde `stock_quantity_total <= low_stock_threshold` (default: 5)

## Flujos de Trabajo

### Flujo 1: Agregar Producto al Inventario

#### Producto Global Existente
```
1. Usuario busca producto en catálogo global
2. Selecciona producto existente
3. Sistema crea Inventory con global_product_id
4. Producto disponible para venta en el negocio
```

#### Producto Nuevo del Negocio
```
1. Usuario no encuentra producto en catálogo
2. Crea nuevo BusinessProduct
3. Sistema crea Inventory con business_product_id
4. Producto exclusivo del negocio disponible
```

### Flujo 2: Proceso de Compra

```
1. Crear orden de compra con productos
2. Recibir mercadería del proveedor
3. Crear/actualizar lotes en inventario
4. Registrar precios de compra
5. Stock disponible para venta
```

### Flujo 3: Proceso de Venta

```
1. Buscar producto unificado (global + negocio)
2. Verificar stock disponible
3. Procesar venta
4. Descontar stock del inventario (FIFO en lotes)
5. Registrar movimiento de inventario
```

### Flujo 4: Control de Vencimientos

```
1. Consulta diaria de lotes próximos a vencer
2. Generar alertas automáticas
3. Aplicar descuentos promocionales
4. Retirar productos vencidos del inventario
```

## Ejemplos de Implementación

### Consulta de Inventario por Negocio

```typescript
// Obtener inventario completo de un negocio
const inventory = await prisma.inventory.findMany({
  where: { business_id: businessId },
  include: {
    businessProduct: {
      include: { category: true }
    },
    globalProduct: {
      include: { 
        brand: true,
        category: true 
      }
    },
    lots: {
      where: { stock_quantity: { gt: 0 } },
      orderBy: { expiration_date: 'asc' }  // FIFO
    },
    prices: {
      where: { 
        is_active: true,
        valid_until: { gte: new Date() }  // No expirados
      }
    }
  }
});
```

### Búsqueda Unificada de Productos

```typescript
// Buscar productos por nombre (globales + negocio)
async searchProducts(businessId: number, searchTerm: string) {
  const [globalProducts, businessProducts] = await Promise.all([
    // Productos globales
    prisma.globalProduct.findMany({
      where: {
        product_name: { contains: searchTerm, mode: 'insensitive' },
        is_active: true
      },
      include: { brand: true, category: true }
    }),
    
    // Productos del negocio
    prisma.businessProduct.findMany({
      where: {
        business_id: businessId,
        product_name: { contains: searchTerm, mode: 'insensitive' },
        is_active: true
      },
      include: { category: true }
    })
  ]);

  // Unificar y normalizar respuestas
  return [
    ...globalProducts.map(p => normalizeGlobalProduct(p)),
    ...businessProducts.map(p => normalizeBusinessProduct(p))
  ];
}
```

### Control de Stock Bajo

```typescript
// Obtener productos con stock bajo
async getLowStockProducts(businessId: number) {
  return prisma.inventory.findMany({
    where: {
      business_id: businessId,
      stock_quantity_total: { lte: 5 }  // Stock <= 5
    },
    include: {
      globalProduct: true,
      businessProduct: true,
      lots: {
        where: { stock_quantity: { gt: 0 } },
        orderBy: { expiration_date: 'asc' }
      }
    }
  });
}
```

### Gestión de Lotes FIFO

```typescript
// Descontar stock siguiendo FIFO
async deductStock(inventoryId: number, quantity: number) {
  const lots = await prisma.lot.findMany({
    where: { 
      inventory_id: inventoryId,
      stock_quantity: { gt: 0 }
    },
    orderBy: [
      { expiration_date: 'asc' },  // Primero los que vencen antes
      { entry_date: 'asc' }        // Luego los más antiguos
    ]
  });

  let remainingQuantity = quantity;
  
  for (const lot of lots) {
    if (remainingQuantity <= 0) break;
    
    const deductFromLot = Math.min(lot.stock_quantity, remainingQuantity);
    
    await prisma.lot.update({
      where: { lot_id: lot.lot_id },
      data: { 
        stock_quantity: lot.stock_quantity - deductFromLot 
      }
    });
    
    remainingQuantity -= deductFromLot;
  }
  
  // Actualizar stock total del inventario
  await prisma.inventory.update({
    where: { inventory_id: inventoryId },
    data: {
      stock_quantity_total: { decrement: quantity - remainingQuantity }
    }
  });
}
```

## Ventajas del Sistema

### 1. **Flexibilidad**
- Productos globales para estandarización
- Productos del negocio para personalización
- Adaptable a diferentes tipos de comercio

### 2. **Escalabilidad**
- Cada negocio maneja su propio inventario
- Catálogo global compartido reduce duplicación
- Crecimiento horizontal sin conflictos

### 3. **Trazabilidad**
- Control completo de lotes
- Historial de movimientos
- Seguimiento desde compra hasta venta

### 4. **Gestión Comercial**
- Múltiples tipos de precios
- Promociones con validez temporal
- Control de márgenes de ganancia

### 5. **Experiencia del Usuario**
- API unificada simplifica integración
- Búsqueda inteligente en todos los productos
- Información de stock en tiempo real

---

## Consideraciones y Mejores Prácticas

### Rendimiento
- Índices en campos de búsqueda (`product_name`, `product_code`)
- Paginación en todas las consultas
- Caché para productos populares

### Integridad de Datos
- Constraints de base de datos para relaciones
- Validaciones en DTOs
- Transacciones para operaciones complejas

### Monitoreo
- Alertas automáticas de stock bajo
- Reportes de productos próximos a vencer
- Métricas de rotación de inventario

Este sistema integral de productos e inventarios proporciona una base sólida para la gestión comercial moderna, combinando flexibilidad, trazabilidad y eficiencia operativa. 