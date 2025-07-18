import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetPurchasesDto {
    // business_id ya no va aquí, viene por header x-business-id

    // Paginación
    @ApiPropertyOptional({ description: 'Página actual para paginación', default: 1 })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : 1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Cantidad de resultados por página', default: 10 })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : 10)
    limit?: number = 10;

    // Ordenamiento
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar',
        enum: ['supplier_name', 'total_amount', 'status', 'created_at', 'updated_at'],
        default: 'created_at'
    })
    @IsOptional()
    @IsIn(['supplier_name', 'total_amount', 'status', 'created_at', 'updated_at'])
    order_by?: 'supplier_name' | 'total_amount' | 'status' | 'created_at' | 'updated_at' = 'created_at';

    @ApiPropertyOptional({
        description: 'Dirección de ordenamiento',
        enum: ['asc', 'desc'],
        default: 'desc'
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    order_direction?: 'asc' | 'desc' = 'desc';

    // Filtros de búsqueda
    @ApiPropertyOptional({ description: 'Buscar por nombre del proveedor' })
    @IsOptional()
    @IsString()
    supplier_name?: string;

    @ApiPropertyOptional({ description: 'Buscar por monto total' })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    total_amount?: number;

    @ApiPropertyOptional({ description: 'Buscar por estado de la compra' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Buscar por fecha de creación (timestamp)' })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    created_at?: number;

    @ApiPropertyOptional({ description: 'Buscar por fecha de actualización (timestamp)' })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    updated_at?: number;
}