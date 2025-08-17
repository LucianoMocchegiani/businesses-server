import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsDto } from './dto/get-products.dto';
import { BusinessHeaders } from '../common/types';

export interface ProductResult {
  product_id: string;
  product_name: string;
  product_description?: string;
  product_code?: string;
  price?: number;
  category?: string;
  created_at: bigint;
  updated_at: bigint;
  // Campos específicos según el tipo
  global_product_id?: number;
  business_product_id?: number;
  business_id?: number;
  // Inventarios con lotes y precios (opcional)
  inventories?: ProductInventory[];
}

export interface ProductsResponse {
  data: ProductResult[];
  total: number;
  page: number;
  last_page: number;
}

export interface InventoryLot {
  lot_id: number;
  lot_number?: string | null;
  entry_date?: bigint | null;
  expiration_date?: bigint | null;
  stock_quantity: number;
}

export interface InventoryPrice {
  inventory_price_id: number;
  price_type: 'BUY' | 'SALE' | 'PROMO';
  price: number;
  valid_from: bigint;
  valid_to?: bigint | null;
  created_at: bigint;
}

export interface ProductInventory {
  inventory_id: number;
  business_id: number;
  stock_quantity_total: number;
  created_at: bigint;
  updated_at: bigint;
  lots: InventoryLot[];
  prices: InventoryPrice[];
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async getAllProducts(query: GetProductsDto, headers: BusinessHeaders): Promise<ProductsResponse> {
    const {
      product_name,
      product_code,
      category,
      include_global = true,
      include_business = true,
      only_with_inventory = false,
      page = 1,
      limit = 50,
    } = query;

    const { business_id } = headers;

    if (!business_id) {
      throw new Error('business_id es obligatorio');
    }

    const results: ProductResult[] = [];
    let globalCount = 0;
    let businessCount = 0;

    // Construir filtros comunes
    const commonWhere: any = {};
    if (product_name) {
      commonWhere.product_name = { contains: product_name, mode: 'insensitive' };
    }
    if (product_code) {
      commonWhere.product_code = { contains: product_code, mode: 'insensitive' };
    }

    // 1. Obtener productos globales si está habilitado
    if (include_global) {
      const globalProducts = await this.prisma.globalProduct.findMany({
        where: {
          ...commonWhere,
          ...(category && {
            productCategories: {
              some: {
                category: {
                  category_name: { contains: category, mode: 'insensitive' }
                }
              }
            }
          })
        },
        include: {
          productCategories: {
            include: {
              category: true
            }
          },
          ...((only_with_inventory) && {
            inventories: {
              where: { business_id },
              include: {
                prices: true,
                lots: true
              }
            }
          })
        },
        orderBy: { product_name: 'asc' },
      });

      globalCount = globalProducts.length;

      for (const product of globalProducts) {
        // Obtener la primera categoría (si existe)
        const firstCategory = product.productCategories?.[0]?.category;

        results.push({
          product_id: `global-${product.product_id}`,
          product_name: product.product_name,
          product_description: product.product_description || undefined,
          product_code: product.product_code || undefined,
          price: product.generic_sale_price ? Number(product.generic_sale_price) : undefined,
          category: firstCategory?.category_name || undefined,
          created_at: product.created_at,
          updated_at: product.updated_at,
          global_product_id: product.product_id,
          inventories: product.inventories?.map((inv: any) => ({
            inventory_id: inv.inventory_id,
            business_id: inv.business_id,
            stock_quantity_total: inv.stock_quantity_total,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
            lots: inv.lots?.map((lot: any) => ({
              lot_id: lot.lot_id,
              lot_number: lot.lot_number,
              entry_date: lot.entry_date ? lot.entry_date : null,
              expiration_date: lot.expiration_date ? lot.expiration_date : null,
              stock_quantity: lot.stock_quantity,
            })) || [],
            prices: inv.prices?.map((price: any) => ({
              inventory_price_id: price.inventory_price_id,
              price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
              price: Number(price.price),
              valid_from: price.valid_from,
              valid_to: price.valid_to ? price.valid_to : null,
              created_at: price.created_at,
            })) || [],
          })) || [],
        });
      }
    }

    // 2. Obtener productos del negocio si está habilitado
    if (include_business) {
      const businessProducts = await this.prisma.businessProduct.findMany({
        where: {
          business_id,
          ...(product_name && {
            product_name: { contains: product_name, mode: 'insensitive' }
          }),
          ...(product_code && {
            product_code: { contains: product_code, mode: 'insensitive' }
          }),
          ...(category && {
            productCategories: {
              some: {
                category: {
                  category_name: { contains: category, mode: 'insensitive' }
                }
              }
            }
          })
        },
        include: {
          productCategories: {
            include: {
              category: true
            }
          },
          ...((only_with_inventory) && {
            inventories: {
              where: { business_id },
              include: {
                prices: true,
                lots: true
              }
            }
          })
        },
        orderBy: { product_name: 'asc' },
      });

      businessCount = businessProducts.length;

      for (const product of businessProducts) {
        // Obtener la primera categoría (si existe)
        const firstCategory = product.productCategories?.[0]?.category;

        // Obtener precio de venta si se solicita
        let salePrice: number | undefined = undefined;
        if (product.inventories && product.inventories.length > 0) {
          // Buscar el precio de venta más reciente y válido
          const allPrices = product.inventories.flatMap((inv: any) => inv.prices || []);
          const salePrices = allPrices.filter(price =>
            price.price_type === 'SALE' &&
            (!price.valid_to || (price.valid_to) > new Date().getTime())
          );

          if (salePrices.length > 0) {
            // Tomar el precio más reciente
            salePrices.sort((a, b) => (b.valid_from) - (a.valid_from));
            salePrice = Number(salePrices[0].price);
          }
        }

        results.push({
          product_id: `business-${product.business_product_id}`,
          product_name: product.product_name || 'Sin nombre',
          product_description: product.product_description || undefined,
          product_code: product.product_code || undefined,
          price: salePrice,
          category: firstCategory?.category_name || undefined,
          created_at: product.created_at,
          updated_at: product.updated_at,
          business_product_id: product.business_product_id,
          business_id: product.business_id,
          inventories: product.inventories?.map((inv: any) => ({
            inventory_id: inv.inventory_id,
            business_id: inv.business_id,
            stock_quantity_total: inv.stock_quantity_total,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
            lots: inv.lots?.map((lot: any) => ({
              lot_id: lot.lot_id,
              lot_number: lot.lot_number,
              entry_date: lot.entry_date ? lot.entry_date : null,
              expiration_date: lot.expiration_date ? lot.expiration_date : null,
              stock_quantity: lot.stock_quantity,
            })) || [],
            prices: inv.prices?.map((price: any) => ({
              inventory_price_id: price.inventory_price_id,
              price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
              price: Number(price.price),
              valid_from: price.valid_from,
              valid_to: price.valid_to ? price.valid_to : null,
              created_at: price.created_at,
            })) || [],
          })) || [],
        });
      }
    }

    // 3. Filtrar productos según criterios especiales
    let filteredResults = results;

    if (only_with_inventory) {
      filteredResults = filteredResults.filter(product =>
        product.inventories && product.inventories.length > 0 // Producto tiene inventario registrado
      );
    }

    // 4. Ordenar todos los resultados por nombre
    filteredResults.sort((a, b) => a.product_name.localeCompare(b.product_name));

    // 5. Aplicar paginación
    const total = filteredResults.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      total,
      page,
      last_page: Math.ceil(total / limit),
    };
  }

  async getProductById(productId: string, headers?: BusinessHeaders): Promise<ProductResult | null> {
    // Parsear el ID para determinar el tipo y el ID real
    const [type, id] = productId.split('-');

    if (type === 'global') {
      const globalProduct = await this.prisma.globalProduct.findUnique({
        where: { product_id: parseInt(id) },
        include: {
          productCategories: {
            include: {
              category: true
            }
          },
          ...(headers?.business_id && {
            inventories: {
              where: { business_id: headers.business_id },
              include: {
                lots: true,
                prices: true
              }
            }
          })
        },
      });

      if (!globalProduct) return null;

      const firstCategory = globalProduct.productCategories?.[0]?.category;

      return {
        product_id: productId,
        product_name: globalProduct.product_name,
        product_description: globalProduct.product_description || undefined,
        product_code: globalProduct.product_code || undefined,
        price: globalProduct.generic_sale_price ? Number(globalProduct.generic_sale_price) : undefined,
        category: firstCategory?.category_name || undefined,
        created_at: globalProduct.created_at,
        updated_at: globalProduct.updated_at,
        global_product_id: globalProduct.product_id,
        // Incluir inventarios con lotes y precios
        ...(headers?.business_id && globalProduct.inventories && {
          inventories: globalProduct.inventories.map((inv: any) => ({
            inventory_id: inv.inventory_id,
            business_id: inv.business_id,
            stock_quantity_total: inv.stock_quantity_total,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
            lots: inv.lots.map((lot: any) => ({
              lot_id: lot.lot_id,
              lot_number: lot.lot_number,
              entry_date: lot.entry_date ? lot.entry_date : null,
              expiration_date: lot.expiration_date ? lot.expiration_date : null,
              stock_quantity: lot.stock_quantity,
            })),
            prices: inv.prices.map((price: any) => ({
              inventory_price_id: price.inventory_price_id,
              price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
              price: Number(price.price),
              valid_from: price.valid_from,
              valid_to: price.valid_to ? price.valid_to : null,
              created_at: price.created_at,
            })),
          }))
        }),
      };
    } else if (type === 'business') {
      const businessProduct = await this.prisma.businessProduct.findUnique({
        where: { business_product_id: parseInt(id) },
        include: {
          productCategories: {
            include: {
              category: true
            }
          },
          ...(headers?.business_id && {
            inventories: {
              where: { business_id: headers.business_id },
              include: {
                lots: true,
                prices: true
              }
            }
          })
        },
      });

      if (!businessProduct) return null;

      const firstCategory = businessProduct.productCategories?.[0]?.category;

      return {
        product_id: productId,
        product_name: businessProduct.product_name || 'Sin nombre',
        product_description: businessProduct.product_description || undefined,
        product_code: businessProduct.product_code || undefined,
        price: undefined,
        category: firstCategory?.category_name || undefined,
        created_at: businessProduct.created_at,
        updated_at: businessProduct.updated_at,
        business_product_id: businessProduct.business_product_id,
        business_id: businessProduct.business_id,
        // Incluir inventarios con lotes y precios
        ...(headers?.business_id && businessProduct.inventories && {
          inventories: businessProduct.inventories.map((inv: any) => ({
            inventory_id: inv.inventory_id,
            business_id: inv.business_id,
            stock_quantity_total: inv.stock_quantity_total,
            created_at: inv.created_at,
            updated_at: inv.updated_at,
            lots: inv.lots.map((lot: any) => ({
              lot_id: lot.lot_id,
              lot_number: lot.lot_number,
              entry_date: lot.entry_date ? lot.entry_date : null,
              expiration_date: lot.expiration_date ? lot.expiration_date : null,
              stock_quantity: lot.stock_quantity,
            })),
            prices: inv.prices.map((price: any) => ({
              inventory_price_id: price.inventory_price_id,
              price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
              price: Number(price.price),
              valid_from: price.valid_from,
              valid_to: price.valid_to ? price.valid_to : null,
              created_at: price.created_at,
            })),
          }))
        }),
      };
    }

    return null;
  }
}
