import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { ProductsService, ProductResult, ProductsResponse, ProductInventoryDetail } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { BusinessHeaders } from '../common/types';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({
        summary: 'Obtener todos los productos (globales y del negocio)',
        description: 'Combina productos globales y productos específicos del negocio en una sola respuesta con paginación y filtros'
    })
    @ApiHeader({
        name: 'x-business-id',
        description: 'ID del negocio',
        required: true,
    })
    @ApiQuery({ name: 'name', required: false, description: 'Buscar por nombre del producto' })
    @ApiQuery({ name: 'barcode', required: false, description: 'Buscar por código de barras' })
    @ApiQuery({ name: 'category', required: false, description: 'Buscar por categoría' })
    @ApiQuery({ name: 'is_active', required: false, description: 'Filtrar por productos activos' })
    @ApiQuery({ name: 'include_global', required: false, description: 'Incluir productos globales', type: 'boolean' })
    @ApiQuery({ name: 'include_business', required: false, description: 'Incluir productos del negocio', type: 'boolean' })
    @ApiQuery({ name: 'include_stock', required: false, description: 'Incluir información de stock', type: 'boolean' })
    @ApiQuery({ name: 'only_low_stock', required: false, description: 'Filtrar solo productos con stock bajo', type: 'boolean' })
    @ApiQuery({ name: 'page', required: false, description: 'Página actual', type: 'number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', type: 'number' })
    @ApiResponse({
        status: 200,
        description: 'Lista de productos obtenida exitosamente',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', description: 'ID compuesto (global-123 o business-456)' },
                            name: { type: 'string', description: 'Nombre del producto' },
                            description: { type: 'string', description: 'Descripción del producto' },
                            barcode: { type: 'string', description: 'Código de barras' },
                            price: { type: 'number', description: 'Precio del producto' },
                            category: { type: 'string', description: 'Categoría del producto' },
                            is_active: { type: 'boolean', description: 'Si el producto está activo' },
                            type: { type: 'string', enum: ['global', 'business'], description: 'Tipo de producto' },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                        }
                    }
                },
                meta: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', description: 'Total de productos' },
                        page: { type: 'number', description: 'Página actual' },
                        limit: { type: 'number', description: 'Límite por página' },
                        totalPages: { type: 'number', description: 'Total de páginas' },
                        globalProducts: { type: 'number', description: 'Cantidad de productos globales' },
                        businessProducts: { type: 'number', description: 'Cantidad de productos del negocio' },
                    }
                }
            }
        }
    })
    async getAllProducts(
        @Query() query: GetProductsDto,
        @Headers() headers: any
    ): Promise<ProductsResponse> {
        const businessHeaders: BusinessHeaders = {
            business_id: parseInt(headers['x-business-id']),
        };

        return this.productsService.getAllProducts(query, businessHeaders);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener un producto por ID',
        description: 'Obtiene un producto específico usando su ID compuesto (global-123 o business-456)'
    })
    @ApiHeader({
        name: 'x-business-id',
        description: 'ID del negocio (opcional, pero requerido para obtener información de stock)',
        required: false,
    })
    @ApiParam({
        name: 'id',
        description: 'ID compuesto del producto (ej: global-123 o business-456)',
        example: 'global-123'
    })
    @ApiResponse({
        status: 200,
        description: 'Producto encontrado',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'ID compuesto (global-123 o business-456)' },
                name: { type: 'string', description: 'Nombre del producto' },
                description: { type: 'string', description: 'Descripción del producto' },
                barcode: { type: 'string', description: 'Código de barras' },
                price: { type: 'number', description: 'Precio del producto' },
                category: { type: 'string', description: 'Categoría del producto' },
                is_active: { type: 'boolean', description: 'Si el producto está activo' },
                type: { type: 'string', enum: ['global', 'business'], description: 'Tipo de producto' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Producto no encontrado'
    })
    async getProductById(
        @Param('id') id: string,
        @Headers() headers: any
    ): Promise<ProductResult | null> {
        const businessHeaders: BusinessHeaders = {
            business_id: parseInt(headers['x-business-id']),
        };

        return this.productsService.getProductById(id, businessHeaders);
    }



    @Get('reports/low-stock')
    @ApiOperation({
        summary: 'Obtener productos con stock bajo',
        description: 'Obtiene la lista de productos que tienen stock bajo (5 unidades o menos)'
    })
    @ApiHeader({
        name: 'x-business-id',
        description: 'ID del negocio',
        required: true,
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de productos con stock bajo',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID compuesto (global-123 o business-456)' },
                    name: { type: 'string', description: 'Nombre del producto' },
                    description: { type: 'string', description: 'Descripción del producto' },
                    barcode: { type: 'string', description: 'Código de barras' },
                    price: { type: 'number', description: 'Precio del producto' },
                    category: { type: 'string', description: 'Categoría del producto' },
                    is_active: { type: 'boolean', description: 'Si el producto está activo' },
                    type: { type: 'string', enum: ['global', 'business'], description: 'Tipo de producto' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' },
                }
            }
        }
    })
    async getLowStockProducts(
        @Headers() headers: any
    ): Promise<ProductResult[]> {
        const businessHeaders: BusinessHeaders = {
            business_id: parseInt(headers['x-business-id']),
        };

        return this.productsService.getLowStockProducts(businessHeaders);
    }

    @Get(':id/inventory')
    @ApiOperation({
        summary: 'Obtener inventarios detallados de un producto',
        description: 'Obtiene toda la información de inventarios de un producto específico incluyendo lotes y precios'
    })
    @ApiHeader({
        name: 'x-business-id',
        description: 'ID del negocio',
        required: true,
    })
    @ApiParam({
        name: 'id',
        description: 'ID compuesto del producto (ej: global-123 o business-456)',
        example: 'global-123'
    })
    @ApiResponse({
        status: 200,
        description: 'Información detallada de inventarios del producto',
        schema: {
            type: 'object',
            properties: {
                product: {
                    type: 'object',
                    description: 'Información básica del producto'
                },
                inventories: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            inventory_id: { type: 'number' },
                            business_id: { type: 'number' },
                            stock_quantity_total: { type: 'number' },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' },
                            lots: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        lot_id: { type: 'number' },
                                        lot_number: { type: 'string' },
                                        entry_date: { type: 'string', format: 'date-time' },
                                        expiration_date: { type: 'string', format: 'date-time' },
                                        stock_quantity: { type: 'number' }
                                    }
                                }
                            },
                            prices: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        inventory_price_id: { type: 'number' },
                                        price_type: { type: 'string', enum: ['BUY', 'SALE', 'PROMO'] },
                                        price: { type: 'number' },
                                        valid_from: { type: 'string', format: 'date-time' },
                                        valid_to: { type: 'string', format: 'date-time' },
                                        created_at: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                },
                total_stock: { type: 'number', description: 'Stock total en todos los inventarios' },
                total_lots: { type: 'number', description: 'Total de lotes' },
                active_prices: {
                    type: 'array',
                    description: 'Precios activos (no expirados)',
                    items: {
                        type: 'object',
                        properties: {
                            inventory_price_id: { type: 'number' },
                            price_type: { type: 'string', enum: ['BUY', 'SALE', 'PROMO'] },
                            price: { type: 'number' },
                            valid_from: { type: 'string', format: 'date-time' },
                            valid_to: { type: 'string', format: 'date-time' },
                            created_at: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Producto no encontrado'
    })
    async getProductInventoryDetail(
        @Param('id') id: string,
        @Headers() headers: any
    ): Promise<ProductInventoryDetail | null> {
        const businessHeaders: BusinessHeaders = {
            business_id: parseInt(headers['x-business-id']),
        };

        return this.productsService.getProductInventoryDetail(id, businessHeaders);
    }
}
