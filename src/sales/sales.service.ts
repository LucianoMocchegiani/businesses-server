import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetSalesDto } from './dto/get-sales.dto';
import { SaleStatus } from '@prisma/client';
import { BusinessHeaders } from '../common/types';
import { transformPrismaPaginatedResponse } from '../common/utils/dateUtils';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) { }

  async getSalesByBusiness(query: GetSalesDto, headers: BusinessHeaders) {
    const {
      page = 1,
      limit = 10,
      order_by = 'created_at',
      order_direction = 'desc',
      customer_name,
      total_amount,
      status,
      created_at,
      updated_at,
    } = query;

    const { business_id } = headers;

    if (!business_id) {
      throw new Error('business_id es obligatorio');
    }

    // Prisma orderBy config
    let order: any = {};
    if (order_by === 'customer_name') {
      order = { customer: { customer_name: order_direction } };
    } else {
      order[order_by] = order_direction;
    }

    // Prisma where config
    const where: any = { business_id };
    if (customer_name) {
      where.customer = { customer_name: { contains: customer_name, mode: 'insensitive' } };
    }
    if (total_amount !== undefined) {
      where.total_amount = total_amount;
    }
    if (status) {
      where.status = status;
    }
    if (created_at) {
      where.created_at = { gte: new Date(created_at) };
    }
    if (updated_at) {
      where.updated_at = { gte: new Date(updated_at) };
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        orderBy: order,
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true, saleDetails: true },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return transformPrismaPaginatedResponse({
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    });
  }

  async getSaleById(saleId: number) {
    return this.prisma.sale.findUnique({
      where: { sale_id: saleId },
      include: { 
        saleDetails: {
          include: {
            businessProduct: true,
            globalProduct: true,
          }
        } 
      },
    });
  }

  async createSale(data: CreateSaleDto, headers: BusinessHeaders) {
    // data.saleDetails: [{business_product_id, global_product_id, quantity, ...}]
    const { business_id } = headers;
    
    // Mapeo de campos de snake_case para los atributos simples y relaciones en camelCase para Prisma
    const saleDetails = data.saleDetails.map(detail => {
      const total = Number(detail.price) * Number(detail.quantity);
      const obj: any = {
        quantity: detail.quantity,
        price: detail.price,
        total_amount: total,
      };
      if (detail.business_product_id) {
        obj.businessProduct = { connect: { business_product_id: detail.business_product_id } };
      }
      if (detail.global_product_id) {
        obj.globalProduct = { connect: { product_id: detail.global_product_id } };
      }
      return obj;
    });

    // Calcular el total de la venta sumando los totales calculados de los detalles
    const totalAmount = saleDetails.reduce(
      (sum, detail) => sum + Number(detail.total_amount || 0),
      0
    );

    try {
      return this.prisma.$transaction(async (tx) => {
        // 1. Crear la venta y sus detalles
        const sale = await tx.sale.create({
          data: {
            business_id,
            customer_id: data.customer_id,
            total_amount: totalAmount,
            status: data.status as SaleStatus,
            saleDetails: {
              create: saleDetails,
            },
          },
          include: { saleDetails: true },
        });

        // 2. Por cada detalle, actualizar inventario y lotes
        for (const detail of sale.saleDetails) {
          // Buscar inventario correspondiente
          const inventory = await tx.inventory.findFirst({
            where: {
              business_id: sale.business_id,
              OR: [
                { business_product_id: detail.business_product_id ?? undefined },
                { global_product_id: detail.global_product_id ?? undefined },
              ],
            },
          });

          if (!inventory) {
            // Determinar el tipo de producto para el mensaje de error
            const productType = detail.business_product_id ? 'business' : 'global';
            const productId = detail.business_product_id || detail.global_product_id;
            throw new Error(`No hay inventario para el producto ${productType}-${productId}. Debe crear inventario inicial o realizar una compra primero.`);
          }

          // Verificar stock suficiente
          if (inventory.stock_quantity_total < detail.quantity) {
            const productType = detail.business_product_id ? 'business' : 'global';
            const productId = detail.business_product_id || detail.global_product_id;
            throw new Error(`Stock insuficiente para el producto ${productType}-${productId}. Stock disponible: ${inventory.stock_quantity_total}, cantidad solicitada: ${detail.quantity}`);
          }

          // Restar del inventario total
          await tx.inventory.update({
            where: { inventory_id: inventory.inventory_id },
            data: {
              stock_quantity_total: {
                decrement: detail.quantity,
              },
              updated_at: new Date(),
            },
          });

          // Restar de los lotes (FIFO)
          let quantityToSubtract = detail.quantity;
          const lots = await tx.lot.findMany({
            where: { inventory_id: inventory.inventory_id, stock_quantity: { gt: 0 } },
            orderBy: { entry_date: 'asc' },
          });

          for (const lot of lots) {
            if (quantityToSubtract <= 0) break;
            const subtract = Math.min(lot.stock_quantity, quantityToSubtract);
            await tx.lot.update({
              where: { lot_id: lot.lot_id },
              data: {
                stock_quantity: { decrement: subtract },
              },
            });
            quantityToSubtract -= subtract;
          }

          if (quantityToSubtract > 0) {
            throw new Error('No hay suficiente stock en los lotes para la venta');
          }
        }

        return sale;
      });
    } catch (error) {
      // Cachear el error y loguearlo
      console.error('Error al crear venta:', error);
      // Re-lanzar el error para que el controlador lo maneje
      throw error;
    }
  }

  async cancelSale(saleId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener la venta y sus detalles
      const sale = await tx.sale.findUnique({
        where: { sale_id: saleId },
        include: { saleDetails: true },
      });

      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      // 2. Por cada detalle, restaurar inventario y lotes
      for (const detail of sale.saleDetails) {
        // Buscar inventario correspondiente
        const inventory = await tx.inventory.findFirst({
          where: {
            business_id: sale.business_id,
            OR: [
              { business_product_id: detail.business_product_id ?? undefined },
              { global_product_id: detail.global_product_id ?? undefined },
            ],
          },
        });

        if (!inventory) continue;

        // Sumar al inventario total
        await tx.inventory.update({
          where: { inventory_id: inventory.inventory_id },
          data: {
            stock_quantity_total: {
              increment: detail.quantity,
            },
            updated_at: new Date(),
          },
        });

        // Sumar a los lotes (LIFO: los más nuevos primero)
        let quantityToRestore = detail.quantity;
        const lots = await tx.lot.findMany({
          where: { inventory_id: inventory.inventory_id },
          orderBy: { entry_date: 'desc' },
        });

        for (const lot of lots) {
          if (quantityToRestore <= 0) break;
          // Restaurar la cantidad al lote
          await tx.lot.update({
            where: { lot_id: lot.lot_id },
            data: {
              stock_quantity: { increment: quantityToRestore },
            },
          });
          // Suponemos que no hay límite superior, si quieres limitar, ajusta aquí
          quantityToRestore = 0;
        }
      }

      // 3. Cambiar el estado de la venta a CANCELED (en lugar de eliminar)
      await tx.sale.update({
        where: { sale_id: saleId },
        data: {
          status: 'CANCELED',
          updated_at: new Date(),
        },
      });

      return { message: 'Venta cancelada y stock restaurado' };
    });
  }
}