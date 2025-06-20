import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetPurchasesDto {
    @ApiProperty({ description: 'ID del negocio' })
    @IsNumber()
    business_id: number;

    // Paginación
    @ApiPropertyOptional({ description: 'Página actual para paginación', default: 1 })
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Cantidad de resultados por página', default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number = 10;

    // Ordenamiento
    @ApiPropertyOptional({
        description: 'Campo por el cual ordenar',
        enum: ['supplier_name', 'total_amount', 'status', 'created_at', 'updated_at'],
        default: 'created_at'
    })
    @IsOptional()
    @IsIn(['supplier_name', 'total_amount', 'status', 'created_at', 'updated_at'])
    orderBy?: 'supplier_name' | 'total_amount' | 'status' | 'created_at' | 'updated_at' = 'created_at';

    @ApiPropertyOptional({
        description: 'Dirección de ordenamiento',
        enum: ['asc', 'desc'],
        default: 'desc'
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    orderDirection?: 'asc' | 'desc' = 'desc';

    // Filtros de búsqueda
    @ApiPropertyOptional({ description: 'Buscar por nombre del proveedor' })
    @IsOptional()
    @IsString()
    supplier_name?: string;

    @ApiPropertyOptional({ description: 'Buscar por monto total' })
    @IsOptional()
    @IsNumber()
    total_amount?: number;

    @ApiPropertyOptional({ description: 'Buscar por estado de la compra' })
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