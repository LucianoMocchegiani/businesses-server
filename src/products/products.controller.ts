import { Controller, Get, Query, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { ProductsService, ProductResult, ProductsResponse } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { BusinessHeaders } from '../common/types';

@ApiTags('Products')
@ApiBearerAuth()
@ApiSecurity('business-id')
@ApiSecurity('profile-id')
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
    @ApiQuery({ name: 'product_name', required: false, description: 'Buscar por nombre del producto' })
    @ApiQuery({ name: 'product_code', required: false, description: 'Buscar por código de barras' })
    @ApiQuery({ name: 'category', required: false, description: 'Buscar por categoría' })
    @ApiQuery({ name: 'include_global', required: false, description: 'Incluir productos globales', type: 'boolean' })
    @ApiQuery({ name: 'include_business', required: false, description: 'Incluir productos del negocio', type: 'boolean' })
    @ApiQuery({ name: 'include_price', required: false, description: 'Incluir precios de venta en la respuesta', type: 'boolean' })
    @ApiQuery({ name: 'only_with_inventory', required: false, description: 'Filtrar solo productos que tienen inventario registrado (sin importar stock)', type: 'boolean' })
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
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            barcode: { type: 'string' },
                            category: { type: 'string' },
                            type: { type: 'string', enum: ['global', 'business'] },
                            is_active: { type: 'boolean' },
                            inventory: {
                                type: 'object',
                                properties: {
                                    stock_quantity_total: { type: 'number' },
                                    stock_quantity_available: { type: 'number' },
                                    stock_quantity_reserved: { type: 'number' },
                                    min_stock_level: { type: 'number' },
                                    max_stock_level: { type: 'number' },
                                    is_low_stock: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' }
                    }
                }
            }
        }
    })
    async getAllProducts(
        @Query() query: GetProductsDto,
        @Headers() headers: any
    ): Promise<ProductsResponse> {
        try {
            const businessHeaders: BusinessHeaders = {
                business_id: parseInt(headers['x-business-id']),
            };

            if (!businessHeaders.business_id) {
                throw new HttpException('x-business-id header es requerido', HttpStatus.BAD_REQUEST);
            }

            return await this.productsService.getAllProducts(query, businessHeaders);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`Error al obtener los productos: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
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
        try {
            const businessHeaders: BusinessHeaders = {
                business_id: parseInt(headers['x-business-id']),
            };

            if (!businessHeaders.business_id) {
                throw new HttpException('x-business-id header es requerido', HttpStatus.BAD_REQUEST);
            }

            return this.productsService.getProductById(id, businessHeaders);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`Error al obtener el producto: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }
}
