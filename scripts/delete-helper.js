const { PrismaClient } = require('@prisma/client');

// Override para usar localhost en lugar del .env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5432/businesses'
    }
  }
});

class DeleteHelper {
  // Eliminar un business completo con todas sus dependencias
  async deleteBusiness(businessId) {
    console.log(`🗑️ Eliminando business ID: ${businessId}`);
    
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar detalles de ventas
        await tx.saleDetail.deleteMany({
          where: {
            sale: { business_id: businessId }
          }
        });
        console.log('✅ Sale details eliminados');

        // 2. Eliminar detalles de compras
        await tx.purchaseDetail.deleteMany({
          where: {
            purchase: { business_id: businessId }
          }
        });
        console.log('✅ Purchase details eliminados');

        // 3. Eliminar ventas
        await tx.sale.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Sales eliminadas');

        // 4. Eliminar compras
        await tx.purchase.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Purchases eliminadas');

        // 5. Eliminar lotes de inventario
        await tx.lot.deleteMany({
          where: {
            inventory: { business_id: businessId }
          }
        });
        console.log('✅ Lots eliminados');

        // 6. Eliminar precios de inventario
        await tx.inventoryPrice.deleteMany({
          where: {
            inventory: { business_id: businessId }
          }
        });
        console.log('✅ Inventory prices eliminados');

        // 7. Eliminar inventarios
        await tx.inventory.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Inventories eliminados');

        // 8. Eliminar categorías de productos
        await tx.productCategory.deleteMany({
          where: {
            businessProduct: { business_id: businessId }
          }
        });
        console.log('✅ Product categories eliminadas');

        // 9. Eliminar productos del business
        await tx.businessProduct.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Business products eliminados');

        // 10. Eliminar ProfileUser (relaciones usuario-perfil)
        await tx.profileUser.deleteMany({
          where: {
            profile: { business_id: businessId }
          }
        });
        console.log('✅ Profile users eliminados');

        // 11. Eliminar permisos
        await tx.permission.deleteMany({
          where: {
            profile: { business_id: businessId }
          }
        });
        console.log('✅ Permissions eliminados');

        // 12. Eliminar perfiles
        await tx.profile.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Profiles eliminados');

        // 13. Eliminar personal
        await tx.personnel.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Personnel eliminado');

        // 14. Eliminar clientes
        await tx.customer.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Customers eliminados');

        // 15. Eliminar proveedores
        await tx.supplier.deleteMany({
          where: { business_id: businessId }
        });
        console.log('✅ Suppliers eliminados');

        // 16. Finalmente eliminar el business
        await tx.business.delete({
          where: { business_id: businessId }
        });
        console.log('✅ Business eliminado');
      });

      console.log(`🎉 Business ${businessId} eliminado exitosamente`);
    } catch (error) {
      console.error('❌ Error eliminando business:', error.message);
      throw error;
    }
  }

  // Eliminar solo un perfil específico
  async deleteProfile(profileId) {
    console.log(`🗑️ Eliminando profile ID: ${profileId}`);
    
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar ProfileUser (relaciones usuario-perfil)
        await tx.profileUser.deleteMany({
          where: { profile_id: profileId }
        });
        console.log('✅ Profile users eliminados');

        // 2. Eliminar permisos del perfil
        await tx.permission.deleteMany({
          where: { profile_id: profileId }
        });
        console.log('✅ Permissions eliminados');

        // 3. Eliminar el perfil
        await tx.profile.delete({
          where: { profile_id: profileId }
        });
        console.log('✅ Profile eliminado');
      });

      console.log(`🎉 Profile ${profileId} eliminado exitosamente`);
    } catch (error) {
      console.error('❌ Error eliminando profile:', error.message);
      throw error;
    }
  }

  // Listar todos los negocios
  async listBusinesses() {
    try {
      const businesses = await prisma.business.findMany({
        include: {
          owner: true,
          _count: {
            select: {
              profiles: true,
              customers: true,
              suppliers: true,
              inventories: true,
              sales: true,
              purchases: true
            }
          }
        }
      });

      console.log('\n📋 NEGOCIOS DISPONIBLES:');
      console.log('========================');
      businesses.forEach(business => {
        console.log(`ID: ${business.business_id}`);
        console.log(`Nombre: ${business.business_name}`);
        console.log(`Owner: ${business.owner?.full_name || 'N/A'}`);
        console.log(`Perfiles: ${business._count.profiles}`);
        console.log(`Clientes: ${business._count.customers}`);
        console.log(`Proveedores: ${business._count.suppliers}`);
        console.log(`Inventarios: ${business._count.inventories}`);
        console.log(`Ventas: ${business._count.sales}`);
        console.log(`Compras: ${business._count.purchases}`);
        console.log('------------------------');
      });

      return businesses;
    } catch (error) {
      console.error('❌ Error listando businesses:', error.message);
      throw error;
    }
  }

  // Listar todos los perfiles
  async listProfiles() {
    try {
      const profiles = await prisma.profile.findMany({
        include: {
          business: true,
          _count: {
            select: {
              permissions: true,
              profileUsers: true
            }
          }
        }
      });

      console.log('\n👥 PERFILES DISPONIBLES:');
      console.log('========================');
      profiles.forEach(profile => {
        console.log(`ID: ${profile.profile_id}`);
        console.log(`Nombre: ${profile.profile_name}`);
        console.log(`Business: ${profile.business.business_name}`);
        console.log(`Permisos: ${profile._count.permissions}`);
        console.log(`Usuarios: ${profile._count.profileUsers}`);
        console.log('------------------------');
      });

      return profiles;
    } catch (error) {
      console.error('❌ Error listando profiles:', error.message);
      throw error;
    }
  }

  // Cerrar conexión
  async disconnect() {
    await prisma.$disconnect();
  }
}

// Función helper para usar desde terminal
async function main() {
  const helper = new DeleteHelper();
  const args = process.argv.slice(2);
  
  try {
    if (args[0] === 'list-businesses') {
      await helper.listBusinesses();
    } else if (args[0] === 'list-profiles') {
      await helper.listProfiles();
    } else if (args[0] === 'delete-business' && args[1]) {
      const businessId = parseInt(args[1]);
      await helper.deleteBusiness(businessId);
    } else if (args[0] === 'delete-profile' && args[1]) {
      const profileId = parseInt(args[1]);
      await helper.deleteProfile(profileId);
    } else {
      console.log('📖 USO:');
      console.log('node scripts/delete-helper.js list-businesses');
      console.log('node scripts/delete-helper.js list-profiles');
      console.log('node scripts/delete-helper.js delete-business <ID>');
      console.log('node scripts/delete-helper.js delete-profile <ID>');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  } finally {
    await helper.disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = DeleteHelper;
