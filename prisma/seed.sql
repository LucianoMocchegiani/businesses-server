-- Seed data for Service table
INSERT INTO "Service" ("service_name", "description", "created_at", "updated_at") VALUES
('users', 'Gestión de usuarios del sistema', NOW(), NOW()),
('businesses', 'Gestión de negocios', NOW(), NOW()),
('products', 'Gestión de productos e inventarios', NOW(), NOW()),
('business_products', 'Gestión de productos de negocio', NOW(), NOW()),
('customers', 'Gestión de clientes', NOW(), NOW()),
('suppliers', 'Gestión de proveedores', NOW(), NOW()),
('sales', 'Gestión de ventas', NOW(), NOW()),
('purchases', 'Gestión de compras', NOW(), NOW()),
('profiles', 'Gestión de perfiles y permisos', NOW(), NOW()),
('categories', 'Gestión de categorías', NOW(), NOW()),
('brands', 'Gestión de marcas', NOW(), NOW()); 