# Contexto del Proyecto - Business Admin System (Backend)

## 🏢 ¿Qué es Business Admin System?

**Business Admin System** es una plataforma integral de gestión para comercios que permite a pequeñas y medianas empresas (kioscos, tiendas, restaurantes, etc.) administrar todos los aspectos de su negocio de forma digital y eficiente.

### Propósito Principal
Digitalizar y optimizar la gestión de comercios tradicionales mediante una solución moderna, escalable y fácil de usar que centralice todas las operaciones comerciales.

## 🎯 Público Objetivo

### Usuarios Primarios
- **Dueños de comercios**: Kioscos, almacenes, tiendas, restaurantes pequeños/medianos
- **Empleados**: Personal autorizado con perfiles específicos
- **Administradores**: Usuarios con acceso completo al sistema

### Casos de Uso Principales
- Gestión de inventario y stock
- Control de ventas y facturación
- Administración de compras a proveedores
- Manejo de clientes y proveedores
- Análisis de datos y reportes
- Control de personal y permisos

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                             │
│              React + TypeScript                         │
│              Material-UI + Vite                         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP REST API
┌─────────────────────▼───────────────────────────────────┐
│                   Backend                               │
│              NestJS + TypeScript                        │
│            Prisma ORM + PostgreSQL                     │
│            Firebase Authentication                      │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL Queries
┌─────────────────────▼───────────────────────────────────┐
│                  Database                               │
│               PostgreSQL                                │
│          (Datos estructurados)                          │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos
1. **Frontend** → Envía peticiones HTTP con autenticación
2. **Backend** → Valida, procesa y ejecuta lógica de negocio
3. **Database** → Almacena y recupera datos de forma persistente

## 👥 Modelo de Usuarios y Negocios

### Flujo de Registro y Onboarding
```
Usuario Nuevo
    ↓
Registro en Firebase
    ↓
Creación de cuenta en el sistema
    ↓
┌─────────────────────┬─────────────────────┐
│   Crear Negocio     │  Ser Invitado a     │
│                     │  Negocio Existente  │
│                     │                     │
│ • Automáticamente   │ • Recibe perfil     │
│   es Owner          │   asignado          │
│ • Permisos totales  │ • Permisos          │
│                     │   limitados         │
└─────────────────────┴─────────────────────┘
            ↓
    Acceso al Sistema de Gestión
```

### Estructura Jerárquica
- **Usuario**: Persona física registrada en el sistema
- **Negocio**: Entidad comercial (kiosco, tienda, etc.)
- **Perfil**: Rol dentro de un negocio con permisos específicos
- **Servicios**: Módulos del sistema (ventas, compras, inventario, etc.)

### Permisos y Roles
Cada usuario puede tener múltiples perfiles en diferentes negocios:
- **Owner/Propietario**: Acceso total a su negocio
- **Administrador**: Permisos amplios pero limitados
- **Empleado**: Acceso restringido a módulos específicos
- **Vendedor**: Solo módulo de ventas e inventario

## 🛍️ Módulos Principales del Sistema

### 1. **Gestión de Usuarios** (`/users`)
- Registro e integración con Firebase
- Asociación con múltiples negocios
- Gestión de perfiles y permisos

### 2. **Gestión de Negocios** (`/businesses`)
- Creación y configuración de comercios
- Información comercial (dirección, teléfono, CUIL)
- Gestión de personal

### 3. **Gestión de Productos** (`/products`)
**Módulo Unificado** que combina:
- **Productos Globales**: Catálogo universal (Coca-Cola, Oreo, etc.)
- **Productos del Negocio**: Productos específicos o personalizados
- Búsqueda inteligente por nombre o código de barras
- Categorización y precios

### 4. **Gestión de Inventario** (`/inventories`)
- Control de stock en tiempo real
- Sistema de lotes para trazabilidad
- Fechas de vencimiento
- Alertas de stock bajo
- Múltiples precios (compra, venta, promoción)

### 5. **Gestión de Ventas** (`/sales`)
- Registro de ventas con detalles
- Estados de venta (pendiente, completada, cancelada)
- Integración automática con inventario
- Facturación y reportes

### 6. **Gestión de Compras** (`/purchases`)
- Órdenes de compra a proveedores
- Recepción de mercadería
- Control de costos
- Integración con inventario (entrada de stock)

### 7. **Gestión de Clientes** (`/customers`)
- Base de datos de clientes
- Información de contacto
- Historial de compras

### 8. **Gestión de Proveedores** (`/suppliers`)
- Catálogo de proveedores
- Información comercial
- Historial de compras

### 9. **Sistema de Permisos** (`/profiles`, `/services`, `/permissions`)
- Perfiles de usuario por negocio
- Servicios del sistema
- Permisos granulares (GET, POST, PUT, DELETE)

## 🔐 Sistema de Autenticación y Seguridad

### Autenticación (Firebase)
```
Usuario → Firebase Auth → Token JWT → Backend Validation → Usuario Autorizado
```

### Autorización (Permisos)
```
Petición → AuthMiddleware → PermissionMiddleware → Controlador → Servicio
     ↓            ↓                ↓                 ↓          ↓
   Token      Validar         Verificar         Ejecutar   Lógica de
  Válido      Usuario         Permisos          Acción     Negocio
```

### Headers de Contexto
Todas las peticiones incluyen contexto automático:
- `Authorization: Bearer <token>` - Autenticación
- `x-business-id: <id>` - Contexto del negocio
- `x-profile-id: <id>` - Perfil activo del usuario

## 📊 Flujo de Operaciones Diarias

### Escenario Típico: Venta en un Kiosco
1. **Cliente llega** → Empleado abre módulo de ventas
2. **Buscar productos** → Escanea código de barras o busca por nombre
3. **Verificar stock** → Sistema muestra disponibilidad automáticamente
4. **Agregar al carrito** → Selecciona cantidad y confirma
5. **Procesar venta** → Sistema descuenta stock automáticamente
6. **Emitir comprobante** → Registro completo de la transacción

### Escenario Típico: Reposición de Stock
1. **Llegada de mercadería** → Empleado abre módulo de compras
2. **Crear orden de compra** → Selecciona proveedor y productos
3. **Recibir mercadería** → Confirma llegada y verifica cantidades
4. **Actualizar inventario** → Sistema suma stock automáticamente
5. **Registrar lotes** → Fechas de vencimiento y trazabilidad

## 🔄 Integración Entre Módulos

### Flujo de Datos Integrado
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Compras   │───▶│ Inventario  │◀───│   Ventas    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Proveedores │    │  Productos  │    │   Clientes  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Ejemplo de Integración
- **Venta** → Reduce stock en **Inventario** → Actualiza **Producto**
- **Compra** → Aumenta stock en **Inventario** → Registra **Lote**
- **Cliente** → Asociado a **Venta** → Historial de compras
- **Proveedor** → Asociado a **Compra** → Catálogo de productos

## 📈 Analíticas y Reportes

### Métricas Clave
- **Ventas por período** (día, semana, mes)
- **Productos más vendidos**
- **Stock bajo** (alertas automáticas)
- **Rentabilidad por producto**
- **Rendimiento del personal**
- **Análisis de clientes**

### Dashboards
- **Panel del propietario**: Métricas generales del negocio
- **Panel del empleado**: Tareas diarias y metas
- **Panel de inventario**: Estado de stock y alertas

## 🌟 Características Distintivas

### 1. **Multi-Negocio**
- Un usuario puede gestionar múltiples comercios
- Contexto de negocio automático en todas las operaciones
- Permisos independientes por negocio

### 2. **Productos Híbridos**
- Catálogo global + productos personalizados
- Búsqueda unificada en una sola consulta
- Flexibilidad total para diferentes tipos de comercio

### 3. **Trazabilidad Completa**
- Control de lotes desde compra hasta venta
- Fechas de vencimiento y alertas
- Historial completo de movimientos

### 4. **Sistema de Permisos Granular**
- Control por módulo y acción (GET, POST, PUT, DELETE)
- Perfiles personalizables por negocio
- Seguridad de nivel empresarial

### 5. **API Moderna y Consistente**
- REST API con patrones estándar
- Respuestas tipadas y predecibles
- Documentación automática con Swagger

## 🚀 Casos de Uso Reales

### Kiosco Tradicional
- Venta de productos empaquetados
- Control de stock simple
- Clientes ocasionales

### Almacén de Barrio
- Variedad de productos
- Clientes frecuentes con cuenta corriente
- Múltiples proveedores

### Restaurante Pequeño
- Ingredientes con fecha de vencimiento
- Control de costos por plato
- Empleados con horarios

### Tienda de Conveniencia
- Productos de rotación rápida
- Promociones frecuentes
- Análisis de tendencias de venta

## 📚 Documentación Complementaria

### 📋 Documentación Principal
- [`configuracion-y-scripts.md`](./configuracion-y-scripts.md) - **Setup completo y scripts**


### 🎯 Patrones y Estándares de Desarrollo
- [`patrones-de-diseño-backend.md`](./patrones-de-diseño-backend.md) - **Patrones de código backend (NestJS)**
- [`../businesses-web/docs/patrones-de-diseño-frontend.md`](../businesses-web/docs/patrones-de-diseño-frontend.md) - **Patrones de código frontend (React)**
- [`modelo_de_datos.md`](./modelo_de_datos.md) - Schema y modelo de base de datos

### 🔧 Funcionalidades Específicas
- [`productos-e-inventarios.md`](./productos-e-inventarios.md) - Sistema unificado de productos e inventarios
- [`ventas.md`](./ventas.md) - Sistema de ventas y facturación
- [`compras.md`](./compras.md) - Sistema de compras y proveedores
- [`autenticacion.md`](./autenticacion.md) - Autenticación con Firebase
- [`permisos _y_ perfiles.md`](./permisos%20_y_%20perfiles.md) - Sistema de permisos y roles

### 🔒 Seguridad y Vulnerabilidades
- [`VULNERABILIDAD-CREACION-USUARIOS.md`](./VULNERABILIDAD-CREACION-USUARIOS.md) - Análisis de seguridad

## 🎯 Objetivos a Futuro

### Corto Plazo (3-6 meses)
- Módulo de reportes avanzados
- Integración con sistemas de facturación
- App móvil para empleados

### Mediano Plazo (6-12 meses)
- Integración con proveedores (órdenes automáticas)
- Sistema de loyalty para clientes
- Predicción de demanda con IA

### Largo Plazo (1-2 años)
- Marketplace de productos
- Integración con e-commerce
- Sistema de franquicias

---

## 🤝 Para Nuevos Desarrolladores

### Primeros Pasos
1. **Revisar este documento** para entender el contexto
2. **Leer [`patrones-de-diseño-backend.md`](./patrones-de-diseño-backend.md)** para entender los estándares
3. **Explorar [`estructura-de-servicios.md`](./estructura-de-servicios.md)** para la arquitectura
4. **Consultar [`modelo_de_datos.md`](./modelo_de_datos.md)** para la base de datos

### Principios de Desarrollo
- **Consistencia**: Seguir los patrones establecidos
- **Seguridad**: Validar siempre contexto y permisos
- **Performance**: Optimizar consultas y paginación
- **Documentación**: Mantener docs actualizadas

### Comandos Útiles
```bash
# Levantar el proyecto
npm run start:dev

# Ver la base de datos
npm run db:studio

# Generar documentación API
# → http://localhost:8080/api/docs

# Ejecutar migraciones
npm run db:deploy
```

---

**Business Admin System** es más que un software de gestión; es una plataforma que digitaliza y moderniza la forma en que los comercios tradicionales operan, proporcionando herramientas empresariales de nivel profesional en una interfaz accesible y fácil de usar. 