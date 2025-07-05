# Módulo Unificado de Productos

## Descripción

Se ha creado un nuevo módulo en el backend llamado `products` que unifica la lógica de productos globales y productos específicos del negocio. Este módulo proporciona endpoints unificados que combinan ambos tipos de productos en una sola respuesta.

## Características

### 1. Endpoints Unificados

- **GET /products** - Obtiene todos los productos (globales + negocio) con paginación y filtros
- **GET /products/:id** - Obtiene un producto específico por ID compuesto
- **GET /products/search/barcode/:barcode** - Busca productos por código de barras
- **GET /products/reports/low-stock** - Obtiene productos con stock bajo

### 2. ID Compuesto

Los productos ahora usan un sistema de ID compuesto:
- `global-123` - Para productos globales (donde 123 es el product_id)
- `business-456` - Para productos del negocio (donde 456 es el business_product_id)

### 3. Respuesta Unificada

Todos los productos se normalizan a la siguiente estructura:

```typescript
interface ProductResult {
  id: string;                    // ID compuesto (ej: "global-123")
  name: string;                  // Nombre del producto
  description?: string;          // Descripción
  barcode?: string;             // Código de barras/código del producto
  price?: number;               // Precio (puede ser undefined para productos de negocio)
  category?: string;            // Nombre de la categoría
  is_active: boolean;           // Estado activo
  type: 'global' | 'business';  // Tipo de producto
  created_at: Date;             // Fecha de creación
  updated_at: Date;             // Fecha de actualización
  
  // Campos específicos según el tipo
  global_product_id?: number;   // Solo para productos globales
  business_product_id?: number; // Solo para productos del negocio
  business_id?: number;         // Solo para productos del negocio
}
```

## Mapeo de Campos del Schema

### Productos Globales (GlobalProduct)
- `product_name` → `name`
- `product_description` → `description`
- `product_code` → `barcode`
- `generic_sale_price` → `price`
- `product_id` → `global_product_id`

### Productos del Negocio (BusinessProduct)
- `custom_name` → `name`
- `custom_description` → `description`
- `custom_code` → `barcode`
- `business_product_id` → `business_product_id`

## Filtros Disponibles

### GET /products
- `name` - Buscar por nombre del producto
- `barcode` - Buscar por código de barras
- `category` - Buscar por categoría
- `is_active` - Filtrar por productos activos
- `include_global` - Incluir productos globales (default: true)
- `include_business` - Incluir productos del negocio (default: true)
- `page` - Página actual (default: 1)
- `limit` - Cantidad por página (default: 50)

## Headers Requeridos

Todos los endpoints requieren el header:
- `x-business-id` - ID del negocio actual

## Paginación

El endpoint `/products` retorna datos paginados con metadatos:

```typescript
interface ProductsResponse {
  data: ProductResult[];
  meta: {
    total: number;           // Total de productos
    page: number;            // Página actual
    limit: number;           // Límite por página
    totalPages: number;      // Total de páginas
    globalProducts: number;  // Cantidad de productos globales
    businessProducts: number; // Cantidad de productos del negocio
  };
}
```

## Información de Stock

### Inclusión de Stock en Respuestas

El módulo de productos ahora puede incluir información de stock para cada producto cuando se proporciona el header `x-business-id`. La información de stock se incluye por defecto pero puede ser deshabilitada.

**Estructura de información de stock:**
```typescript
{
  stock: {
    quantity: number;              // Cantidad total en stock
    low_stock_threshold: number;   // Umbral de stock bajo (configurable, default: 5)
    is_low_stock: boolean;        // Si el producto tiene stock bajo
  }
}
```

### Parámetros de Consulta Relacionados con Stock

- `include_stock`: (boolean, default: true) - Incluir información de stock en la respuesta
- `only_low_stock`: (boolean, default: false) - Mostrar solo productos con stock bajo

### Ejemplos de Uso

**Obtener todos los productos con stock:**
```
GET /products?include_stock=true
```

**Obtener solo productos con stock bajo:**
```
GET /products?only_low_stock=true
```

**Obtener productos sin información de stock (más rápido):**
```
GET /products?include_stock=false
```

**Buscar producto por código de barras con stock:**
```
GET /products?barcode=1234567890&include_stock=true
```

## Productos con Stock Bajo

El endpoint `/products/reports/low-stock` retorna productos que tienen 5 unidades o menos en inventario.

## Implementación Frontend

El frontend ha sido actualizado para usar el nuevo endpoint unificado:

```typescript
// Antes (múltiples llamadas)
const globalProducts = await apiService.get('/global-products');
const businessProducts = await apiService.get('/business-products');
const allProducts = [...globalProducts, ...businessProducts];

// Ahora (una sola llamada)
const response = await apiService.get('/products');
const allProducts = response.data;
```

## Ventajas del Nuevo Módulo

1. **Unificación**: Un solo endpoint para todos los productos
2. **Consistencia**: Estructura de respuesta normalizada
3. **Eficiencia**: Menos llamadas HTTP desde el frontend
4. **Escalabilidad**: Paginación y filtros integrados
5. **Flexibilidad**: Puede incluir/excluir tipos de productos
6. **Búsqueda Inteligente**: Prioriza productos del negocio en búsquedas

## Archivos Creados/Modificados

### Backend
- `src/products/products.service.ts` - Servicio unificado
- `src/products/products.controller.ts` - Controlador con endpoints
- `src/products/products.module.ts` - Módulo NestJS
- `src/products/dto/get-products.dto.ts` - DTO para filtros
- `src/app.module.ts` - Registro del nuevo módulo

### Frontend
- `businesses-web/src/services/productService.ts` - Actualizado para usar nuevo endpoint

## Compatibilidad

Los endpoints antiguos (`/global-products` y `/business-products`) siguen funcionando para mantener compatibilidad con código existente, pero se recomienda migrar al nuevo endpoint unificado.
