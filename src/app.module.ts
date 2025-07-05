import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ServicesnpxController } from './nest/servicesnpx/servicesnpx.controller';
import { BusinessesModule } from './businesses/businesses.module';
import { BusinessesController } from './businesses/businesses.controller';
import { BusinessesService } from './businesses/businesses.service';
import { SalesService } from './sales/sales.service';
import { SalesController } from './sales/sales.controller';
import { SalesModule } from './sales/sales.module';
import { PurchasesService } from './purchases/purchases.service';
import { PurchasesController } from './purchases/purchases.controller';
import { PurchasesModule } from './purchases/purchases.module';
import { GlobalProductsService } from './global-products/global-products.service';
import { GlobalProductsModule } from './global-products/global-products.module';
import { GlobalProductsController } from './global-products/global-products.controller';
import { BusinessProductsService } from './business-products/business-products.service';
import { BusinessProductsModule } from './business-products/business-products.module';
import { BusinessProductsController } from './business-products/business-products.controller';
import { CategoriesService } from './categories/categories.service';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesController } from './categories/categories.controller';
import { ProfilesService } from './profiles/profiles.service';
import { ProfilesModule } from './profiles/profiles.module';
import { ProfilesController } from './profiles/profiles.controller';
import { ServicesService } from './services/services.service';
import { ServicesModule } from './services/services.module';
import { ServicesController } from './services/services.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SuppliersController } from './suppliers/suppliers.controller';
import { CustomersService } from './customers/customers.service';
import { CustomersModule } from './customers/customers.module';
import { CustomersController } from './customers/customers.controller';
import { InventoriesService } from './inventories/inventories.service';
import { InventoriesModule } from './inventories/inventories.module';
import { InventoriesController } from './inventories/inventories.controller';
import { BrandsService } from './brands/brands.service';
import { BrandsModule } from './brands/brands.module';
import { BrandsController } from './brands/brands.controller';

// Middlewares
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { PermissionMiddleware } from './common/middlewares/permission.middleware';

@Module({
  imports: [PrismaModule, UsersModule, BusinessesModule, SalesModule, PurchasesModule, GlobalProductsModule, BusinessProductsModule, CategoriesModule, ProfilesModule, ServicesModule, SuppliersModule, CustomersModule, InventoriesModule, BrandsModule],
  controllers: [AppController, ServicesnpxController, UsersController, BusinessesController, SalesController, PurchasesController, GlobalProductsController, BusinessProductsController, CategoriesController, ProfilesController, ServicesController, SuppliersController, CustomersController, InventoriesController, BrandsController],
  providers: [AppService, UsersService, BusinessesService, SalesService, PurchasesService, GlobalProductsService, BusinessProductsService, CategoriesService, ProfilesService, ServicesService, SuppliersService, CustomersService, InventoriesService, BrandsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, PermissionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); 
  }
}