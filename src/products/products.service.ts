import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsDto } from './dto/get-products.dto';
import { BusinessHeaders } from '../common/types';

export interface ProductResult {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  price?: number;
  category?: string;
  is_active: boolean;
  type: 'global' | 'business';
  created_at: Date;
  updated_at: Date;
  // Información de stock
  stock?: {
    quantity: number;
    low_stock_threshold: number;
    is_low_stock: boolean;
  };
  // Campos específicos según el tipo
  global_product_id?: number;
  business_product_id?: number;
  business_id?: number;
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
  entry_date?: Date | null;
  expiration_date?: Date | null;
  stock_quantity: number;
}

export interface InventoryPrice {
  inventory_price_id: number;
  price_type: 'BUY' | 'SALE' | 'PROMO';
  price: number;
  valid_from: Date;
  valid_to?: Date | null;
  created_at: Date;
}

export interface ProductInventory {
  inventory_id: number;
  business_id: number;
  stock_quantity_total: number;
  created_at: Date;
  updated_at: Date;
  lots: InventoryLot[];
  prices: InventoryPrice[];
}

export interface ProductInventoryDetail {
  product: ProductResult;
  inventories: ProductInventory[];
  total_stock: number;
  total_lots: number;
  active_prices: InventoryPrice[];
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAllProducts(query: GetProductsDto, headers: BusinessHeaders): Promise<ProductsResponse> {
    const {
      name,
      barcode,
      category,
      is_active,
      include_global = true,
      include_business = true,
      include_stock = true,
      only_low_stock = false,
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
    if (name) {
      commonWhere.product_name = { contains: name, mode: 'insensitive' };
    }
    if (barcode) {
      commonWhere.product_code = { contains: barcode, mode: 'insensitive' };
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
          ...(include_stock && {
            inventories: {
              where: { business_id }
            }
          })
        },
        orderBy: { product_name: 'asc' },
      });

      globalCount = globalProducts.length;

      for (const product of globalProducts) {
        // Obtener la primera categoría (si existe)
        const firstCategory = product.productCategories?.[0]?.category;
        
        // Calcular stock total para este negocio (si se solicita)
        const stockInfo = include_stock && product.inventories ? (() => {
          const totalStock = product.inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
          const lowStockThreshold = 5; // Configurable
          return {
            quantity: totalStock,
            low_stock_threshold: lowStockThreshold,
            is_low_stock: totalStock <= lowStockThreshold
          };
        })() : undefined;
        
        results.push({
          id: `global-${product.product_id}`,
          name: product.product_name,
          description: product.product_description || undefined,
          barcode: product.product_code || undefined,
          price: product.generic_sale_price ? Number(product.generic_sale_price) : undefined,
          category: firstCategory?.category_name || undefined,
          is_active: true, // Los productos globales se asumen activos
          type: 'global',
          created_at: product.created_at,
          updated_at: product.updated_at,
          ...(stockInfo && { stock: stockInfo }),
          global_product_id: product.product_id,
        });
      }
    }

    // 2. Obtener productos del negocio si está habilitado
    if (include_business) {
      const businessProducts = await this.prisma.businessProduct.findMany({
        where: {
          business_id,
          ...(name && {
            custom_name: { contains: name, mode: 'insensitive' }
          }),
          ...(barcode && {
            custom_code: { contains: barcode, mode: 'insensitive' }
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
          ...(include_stock && {
            inventories: {
              where: { business_id }
            }
          })
        },
        orderBy: { custom_name: 'asc' },
      });

      businessCount = businessProducts.length;

      for (const product of businessProducts) {
        // Obtener la primera categoría (si existe)
        const firstCategory = product.productCategories?.[0]?.category;
        
        // Calcular stock total para este negocio (si se solicita)
        const stockInfo = include_stock && product.inventories ? (() => {
          const totalStock = product.inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
          const lowStockThreshold = 5; // Configurable
          return {
            quantity: totalStock,
            low_stock_threshold: lowStockThreshold,
            is_low_stock: totalStock <= lowStockThreshold
          };
        })() : undefined;
        
        results.push({
          id: `business-${product.business_product_id}`,
          name: product.custom_name || 'Sin nombre',
          description: product.custom_description || undefined,
          barcode: product.custom_code || undefined,
          price: undefined, // Los precios van por separado en InventoryPrice
          category: firstCategory?.category_name || undefined,
          is_active: true, // Los productos del negocio se asumen activos
          type: 'business',
          created_at: product.created_at,
          updated_at: product.updated_at,
          ...(stockInfo && { stock: stockInfo }),
          business_product_id: product.business_product_id,
          business_id: product.business_id,
        });
      }
    }

    // 3. Filtrar productos según criterios especiales
    let filteredResults = results;
    
    if (only_low_stock && include_stock) {
      filteredResults = filteredResults.filter(product => 
        product.stock && product.stock.is_low_stock
      );
    }
    
    if (only_with_inventory && include_stock) {
      filteredResults = filteredResults.filter(product => 
        product.stock && product.stock.quantity > 0
      );
    }

    // 4. Ordenar todos los resultados por nombre
    filteredResults.sort((a, b) => a.name.localeCompare(b.name));

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
              where: { business_id: headers.business_id }
            }
          })
        },
      });

      if (!globalProduct) return null;

      const firstCategory = globalProduct.productCategories?.[0]?.category;
      
      // Calcular stock si hay business_id
      const stockInfo = headers?.business_id && globalProduct.inventories ? (() => {
        const totalStock = globalProduct.inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
        const lowStockThreshold = 5;
        return {
          quantity: totalStock,
          low_stock_threshold: lowStockThreshold,
          is_low_stock: totalStock <= lowStockThreshold
        };
      })() : undefined;

      return {
        id: productId,
        name: globalProduct.product_name,
        description: globalProduct.product_description || undefined,
        barcode: globalProduct.product_code || undefined,
        price: globalProduct.generic_sale_price ? Number(globalProduct.generic_sale_price) : undefined,
        category: firstCategory?.category_name || undefined,
        is_active: true,
        type: 'global',
        created_at: globalProduct.created_at,
        updated_at: globalProduct.updated_at,
        ...(stockInfo && { stock: stockInfo }),
        global_product_id: globalProduct.product_id,
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
              where: { business_id: headers.business_id }
            }
          })
        },
      });

      if (!businessProduct) return null;

      const firstCategory = businessProduct.productCategories?.[0]?.category;
      
      // Calcular stock si hay business_id
      const stockInfo = headers?.business_id && businessProduct.inventories ? (() => {
        const totalStock = businessProduct.inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
        const lowStockThreshold = 5;
        return {
          quantity: totalStock,
          low_stock_threshold: lowStockThreshold,
          is_low_stock: totalStock <= lowStockThreshold
        };
      })() : undefined;

      return {
        id: productId,
        name: businessProduct.custom_name || 'Sin nombre',
        description: businessProduct.custom_description || undefined,
        barcode: businessProduct.custom_code || undefined,
        price: undefined,
        category: firstCategory?.category_name || undefined,
        is_active: true,
        type: 'business',
        created_at: businessProduct.created_at,
        updated_at: businessProduct.updated_at,
        ...(stockInfo && { stock: stockInfo }),
        business_product_id: businessProduct.business_product_id,
        business_id: businessProduct.business_id,
      };
    }

    return null;
  }

  async getLowStockProducts(headers: BusinessHeaders): Promise<ProductResult[]> {
    const { business_id } = headers;

    // Obtener productos con stock bajo basado en el inventario
    const lowStockInventories = await this.prisma.inventory.findMany({
      where: {
        business_id,
        stock_quantity_total: { lte: 5 }, // Considerar bajo stock si tiene 5 o menos unidades
      },
      include: {
        businessProduct: {
          include: {
            productCategories: {
              include: {
                category: true
              }
            }
          }
        },
        globalProduct: {
          include: {
            productCategories: {
              include: {
                category: true
              }
            }
          }
        }
      },
    });

    const results: ProductResult[] = [];

    for (const inventory of lowStockInventories) {
      if (inventory.businessProduct) {
        const product = inventory.businessProduct;
        const firstCategory = product.productCategories?.[0]?.category;

        results.push({
          id: `business-${product.business_product_id}`,
          name: product.custom_name || 'Sin nombre',
          description: product.custom_description || undefined,
          barcode: product.custom_code || undefined,
          price: undefined,
          category: firstCategory?.category_name || undefined,
          is_active: true,
          type: 'business',
          created_at: product.created_at,
          updated_at: product.updated_at,
          business_product_id: product.business_product_id,
          business_id: product.business_id,
        });
      } else if (inventory.globalProduct) {
        const product = inventory.globalProduct;
        const firstCategory = product.productCategories?.[0]?.category;

        results.push({
          id: `global-${product.product_id}`,
          name: product.product_name,
          description: product.product_description || undefined,
          barcode: product.product_code || undefined,
          price: product.generic_sale_price ? Number(product.generic_sale_price) : undefined,
          category: firstCategory?.category_name || undefined,
          is_active: true,
          type: 'global',
          created_at: product.created_at,
          updated_at: product.updated_at,
          global_product_id: product.product_id,
        });
      }
    }

    return results;
  }

  async getProductInventoryDetail(productId: string, headers: BusinessHeaders): Promise<ProductInventoryDetail | null> {
    const { business_id } = headers;

    if (!business_id) {
      throw new Error('business_id es obligatorio');
    }

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
          inventories: {
            where: { business_id },
            include: {
              lots: true,
              prices: true
            }
          }
        },
      });

      if (!globalProduct) return null;

      const firstCategory = globalProduct.productCategories?.[0]?.category;

      // Transformar inventarios
      const inventories: ProductInventory[] = globalProduct.inventories.map(inv => ({
        inventory_id: inv.inventory_id,
        business_id: inv.business_id,
        stock_quantity_total: inv.stock_quantity_total,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        lots: inv.lots.map(lot => ({
          lot_id: lot.lot_id,
          lot_number: lot.lot_number,
          entry_date: lot.entry_date,
          expiration_date: lot.expiration_date,
          stock_quantity: lot.stock_quantity,
        })),
        prices: inv.prices.map(price => ({
          inventory_price_id: price.inventory_price_id,
          price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
          price: Number(price.price),
          valid_from: price.valid_from,
          valid_to: price.valid_to,
          created_at: price.created_at,
        })),
      }));

      // Calcular totales
      const totalStock = inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
      const totalLots = inventories.reduce((sum, inv) => sum + inv.lots.length, 0);
      
      // Obtener precios activos (que no han expirado)
      const activePrices = inventories.flatMap(inv => 
        inv.prices.filter(price => !price.valid_to || new Date(price.valid_to) > new Date())
      );

      return {
        product: {
          id: productId,
          name: globalProduct.product_name,
          description: globalProduct.product_description || undefined,
          barcode: globalProduct.product_code || undefined,
          price: globalProduct.generic_sale_price ? Number(globalProduct.generic_sale_price) : undefined,
          category: firstCategory?.category_name || undefined,
          is_active: true,
          type: 'global',
          created_at: globalProduct.created_at,
          updated_at: globalProduct.updated_at,
          stock: {
            quantity: totalStock,
            low_stock_threshold: 5,
            is_low_stock: totalStock <= 5
          },
          global_product_id: globalProduct.product_id,
        },
        inventories,
        total_stock: totalStock,
        total_lots: totalLots,
        active_prices: activePrices,
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
          inventories: {
            where: { business_id },
            include: {
              lots: true,
              prices: true
            }
          }
        },
      });

      if (!businessProduct) return null;

      const firstCategory = businessProduct.productCategories?.[0]?.category;

      // Transformar inventarios
      const inventories: ProductInventory[] = businessProduct.inventories.map(inv => ({
        inventory_id: inv.inventory_id,
        business_id: inv.business_id,
        stock_quantity_total: inv.stock_quantity_total,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        lots: inv.lots.map(lot => ({
          lot_id: lot.lot_id,
          lot_number: lot.lot_number,
          entry_date: lot.entry_date,
          expiration_date: lot.expiration_date,
          stock_quantity: lot.stock_quantity,
        })),
        prices: inv.prices.map(price => ({
          inventory_price_id: price.inventory_price_id,
          price_type: price.price_type as 'BUY' | 'SALE' | 'PROMO',
          price: Number(price.price),
          valid_from: price.valid_from,
          valid_to: price.valid_to,
          created_at: price.created_at,
        })),
      }));

      // Calcular totales
      const totalStock = inventories.reduce((sum, inv) => sum + inv.stock_quantity_total, 0);
      const totalLots = inventories.reduce((sum, inv) => sum + inv.lots.length, 0);
      
      // Obtener precios activos (que no han expirado)
      const activePrices = inventories.flatMap(inv => 
        inv.prices.filter(price => !price.valid_to || new Date(price.valid_to) > new Date())
      );

      return {
        product: {
          id: productId,
          name: businessProduct.custom_name || 'Sin nombre',
          description: businessProduct.custom_description || undefined,
          barcode: businessProduct.custom_code || undefined,
          price: undefined,
          category: firstCategory?.category_name || undefined,
          is_active: true,
          type: 'business',
          created_at: businessProduct.created_at,
          updated_at: businessProduct.updated_at,
          stock: {
            quantity: totalStock,
            low_stock_threshold: 5,
            is_low_stock: totalStock <= 5
          },
          business_product_id: businessProduct.business_product_id,
          business_id: businessProduct.business_id,
        },
        inventories,
        total_stock: totalStock,
        total_lots: totalLots,
        active_prices: activePrices,
      };
    }

    return null;
  }
}
