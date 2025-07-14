import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetSalesDto {
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
        enum: ['customer_name', 'total_amount', 'status', 'created_at', 'updated_at'],
        default: 'created_at'
    })
    @IsOptional()
    @IsIn(['customer_name', 'total_amount', 'status', 'created_at', 'updated_at'])
    order_by?: 'customer_name' | 'total_amount' | 'status' | 'created_at' | 'updated_at' = 'created_at';

    @ApiPropertyOptional({
        description: 'Dirección de ordenamiento',
        enum: ['asc', 'desc'],
        default: 'desc'
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    order_direction?: 'asc' | 'desc' = 'desc';

    // Filtros de búsqueda
    @ApiPropertyOptional({ description: 'Buscar por nombre del cliente' })
    @IsOptional()
    @IsString()
    customer_name?: string;

    @ApiPropertyOptional({ description: 'Buscar por monto total' })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => value ? parseFloat(value) : undefined)
    total_amount?: number;

    @ApiPropertyOptional({ description: 'Buscar por estado de la venta' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({ description: 'Buscar por fecha de creación (ISO date string)' })
    @IsOptional()
    @IsString()
    created_at?: string;

    @ApiPropertyOptional({ description: 'Buscar por fecha de actualización (ISO date string)' })
    @IsOptional()
    @IsString()
    updated_at?: string;
}