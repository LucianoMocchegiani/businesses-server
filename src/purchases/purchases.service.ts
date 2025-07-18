import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { GetPurchasesDto } from './dto/get-purchases.dto';
import { PurchaseStatus } from '@prisma/client';
import { BusinessHeaders } from '../common/types';
import { transformPrismaPaginatedResponse, convertTimestampsToDates } from '../common/utils/dateUtils';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) { }

  async getPurchasesByBusiness(query: GetPurchasesDto, headers: BusinessHeaders) {
    const {
      page = 1,
      limit = 10,
      order_by = 'created_at',
      order_direction = 'desc',
      supplier_name,
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
    if (order_by === 'supplier_name') {
      order = { supplier: { supplier_name: order_direction } };
    } else {
      order[order_by] = order_direction;
    }

    // Prisma where config
    const where: any = { business_id };
    if (supplier_name) {
      where.supplier = { supplier_name: { contains: supplier_name, mode: 'insensitive' } };
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
      this.prisma.purchase.findMany({
        where,
        orderBy: order,
        skip: (page - 1) * limit,
        take: limit,
        include: { supplier: true, purchaseDetails: true },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return transformPrismaPaginatedResponse({
      data,
      total,
      page,
      last_page: Math.ceil(total / limit),
    });
  }

  async getPurchaseById(purchaseId: number) {
    return this.prisma.purchase.findUnique({
      where: { purchase_id: purchaseId },
      include: { purchaseDetails: true },
    });
  }

  // Nuevo método para crear una compra y actualizar inventario
  async createPurchase(data: CreatePurchaseDto, headers: BusinessHeaders) {
    // data debe incluir purchaseDetails: [{business_product_id, global_product_id, quantity, lot_number, entry_date, expiration_date, ...}]
    const { business_id } = headers;
    
    // Mapeo de campos de snake_case para los atributos simples y relaciones en camelCase para Prisma
    const purchaseDetails = data.purchaseDetails.map(detail => {
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

    // Calcular el total de la compra sumando los totales calculados de los detalles
    const totalAmount = purchaseDetails.reduce(
      (sum, detail) => sum + Number(detail.total_amount || 0),
      0
    );

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear la compra y sus detalles
      const purchase = await tx.purchase.create({
        data: {
          business_id,
          supplier_id: data.supplier_id,
          total_amount: totalAmount,
          status: data.status as PurchaseStatus,
          purchaseDetails: {
            create: purchaseDetails,
          },
        },
        include: { purchaseDetails: true },
      });

      // 2. Por cada detalle, crear o actualizar inventario y crear lote
      for (let i = 0; i < purchase.purchaseDetails.length; i++) {
        const detail = purchase.purchaseDetails[i];
        // Buscar si ya existe inventario para ese producto en ese negocio
        let inventory = await tx.inventory.findFirst({
          where: {
            business_id: purchase.business_id,
            OR: [
              { business_product_id: detail.business_product_id ?? undefined },
              { global_product_id: detail.global_product_id ?? undefined },
            ],
          },
        });

        if (inventory) {
          // Si existe, sumar la cantidad comprada
          await tx.inventory.update({
            where: { inventory_id: inventory.inventory_id },
            data: {
              stock_quantity_total: {
                increment: detail.quantity,
              },
              updated_at: new Date(),
            },
          });
        } else {
          // Si no existe, crear nuevo inventario
          inventory = await tx.inventory.create({
            data: {
              business_id: purchase.business_id,
              business_product_id: detail.business_product_id,
              global_product_id: detail.global_product_id,
              stock_quantity_total: detail.quantity,
            },
          });
        }

        // Tomar los datos de lote desde el DTO original, ya que purchaseDetails de Prisma no los incluye
        const originalDetail = data.purchaseDetails[i];

        // Crear el lote asociado a este inventario
        await tx.lot.create({
          data: {
            inventory_id: inventory.inventory_id,
            lot_number: originalDetail.lot_number ?? null,
            entry_date: originalDetail.entry_date ? new Date(originalDetail.entry_date) : new Date(),
            expiration_date: originalDetail.expiration_date ? new Date(originalDetail.expiration_date) : null,
            stock_quantity: detail.quantity,
          },
        });
      }

      return purchase;
    });
  }

  async cancelPurchase(purchaseId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener la compra y sus detalles
      const purchase = await tx.purchase.findUnique({
        where: { purchase_id: purchaseId },
        include: { purchaseDetails: true },
      });

      if (!purchase) {
        throw new Error('Compra no encontrada');
      }

      // 2. Por cada detalle, restar inventario y lotes
      for (const detail of purchase.purchaseDetails) {
        // Buscar inventario correspondiente
        const inventory = await tx.inventory.findFirst({
          where: {
            business_id: purchase.business_id,
            OR: [
              { business_product_id: detail.business_product_id ?? undefined },
              { global_product_id: detail.global_product_id ?? undefined },
            ],
          },
        });

        if (!inventory) continue;

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

        // Restar de los lotes (LIFO: los más nuevos primero)
        let quantityToSubtract = detail.quantity;
        const lots = await tx.lot.findMany({
          where: { inventory_id: inventory.inventory_id, stock_quantity: { gt: 0 } },
          orderBy: { entry_date: 'desc' },
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
      }

      // 3. Eliminar la compra y sus detalles
      await tx.purchaseDetail.deleteMany({ where: { purchase_id: purchaseId } });
      await tx.purchase.delete({ where: { purchase_id: purchaseId } });

      return { message: 'Compra cancelada y stock revertido' };
    });
  }
}