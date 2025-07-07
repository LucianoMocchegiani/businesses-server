-- Seed data for Service table
INSERT INTO "Service" (service_name, description, created_at, updated_at) VALUES
  ('users', 'Gestión de usuarios del sistema', NOW(), NOW()),
  ('businesses', 'Gestión de negocios', NOW(), NOW()),
  ('customers', 'Gestión de clientes', NOW(), NOW()),
  ('suppliers', 'Gestión de proveedores', NOW(), NOW()),
  ('global-products', 'Gestión de productos globales', NOW(), NOW()),
  ('business-products', 'Gestión de productos del negocio', NOW(), NOW()),
  ('categories', 'Gestión de categorías', NOW(), NOW()),
  ('brands', 'Gestión de marcas', NOW(), NOW()),
  ('inventories', 'Gestión de inventarios', NOW(), NOW()),
  ('sales', 'Gestión de ventas', NOW(), NOW()),
  ('purchases', 'Gestión de compras', NOW(), NOW())
ON CONFLICT (service_name) DO NOTHING;