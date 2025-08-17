# 🚀 Guía Completa para Probar la API con Swagger

## 📋 **Flujo Completo de Testing**

Esta guía te llevará paso a paso para probar toda la funcionalidad de la API desde crear una cuenta hasta gestionar un negocio completo, incluyendo configuración de autenticación, headers y troubleshooting.

## 🔑 **Configuración Rápida**

### **Tipos de Endpoints**
- **🌐 Públicos**: No requieren autenticación (`health`, `docs`, `auth/*`, `users` POST)
- **🔐 Solo Token**: Requieren Bearer Auth (`users` GET, `businesses/user`)  
- **🏢 Token + Context**: Requieren Bearer Auth + headers business/profile (`customers`, `products`, etc.)

### **Headers Necesarios**
- **Authorization**: Token de Firebase (SIN "Bearer" en Swagger)
- **x-business-id**: ID del negocio (ej: `1`)
- **x-profile-id**: ID del perfil (ej: `1`)

---

## **🔥 PASO 1: Crear Cuenta en Firebase**

### **1.1 Registrarse con un nuevo usuario**

**Endpoint**: `POST /api/auth/signup`

**Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response esperado**:
```json
{
  "success": true,
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU...",
  "refreshToken": "AMf-vBxhEWoWEgACH_KlTWJmrzGe...",
  "expiresIn": "3600",
  "localId": "2K9NAA8w8aWNmLiY844ByYULCN53",
  "email": "test@example.com",
  "instructions": "✅ Copia este token y úsalo en el botón 'Authorize' de Swagger (SIN 'Bearer'): eyJhbGciOiJSUzI1NiIsImtpZCI6IjU..."
}
```

### **1.2 Guardar datos importantes**
- ✅ **localId**: `2K9NAA8w8aWNmLiY844ByYULCN53` (Firebase UID)
- ✅ **idToken**: Para autenticación en Swagger
- ✅ **email**: Para futuras referencias

---

## **🔐 PASO 2: Autenticarse en Swagger**

### **2.1 Usar el token de autenticación**

1. **Hacer clic en el botón "Authorize" (🔒)** en la parte superior de Swagger
2. **Pegar SOLO el token** en el campo "Value" (SIN "Bearer"):
   ```
   eyJhbGciOiJSUzI1NiIsImtpZCI6IjU...
   ```
3. **Hacer clic en "Authorize"**
4. **Verificar que aparece "🔓 Authorized"**

### **2.2 Verificar autenticación**

**Endpoint**: `GET /api/health`

**Response esperado**:
```json
{
  "status": "OK",
  "timestamp": "2025-01-16T23:30:00.000Z",
  "services": {
    "database": {
      "status": "OK",
      "url": "postgresql://postgres:***@..."
    },
    "firebase": {
      "status": "OK",
      "projectId": "businesses-dev-41943"
    }
  },
  "uptime": 120.5,
  "version": "1.0.0"
}
```

---

## **👤 PASO 3: Crear Usuario en la Base de Datos**

### **3.1 Crear el registro de usuario (SIN TOKEN - Es Público)**

**Endpoint**: `POST /api/users`  
**⚠️ IMPORTANTE**: Este endpoint es PÚBLICO, no necesitas configurar autorización todavía.

**Body**:
```json
{
  "firebase_uid": "2K9NAA8w8aWNmLiY844ByYULCN53",
  "full_name": "Juan Pérez"
}
```

**Response esperado**:
```json
{
  "user_id": 1,
  "firebase_uid": "2K9NAA8w8aWNmLiY844ByYULCN53",
  "full_name": "Juan Pérez",
  "created_at": 1705450800000,
  "updated_at": 1705450800000
}
```

### **3.2 Guardar el ID del usuario**
- ✅ **user_id**: `1` (para crear el negocio)

---

## **🏢 PASO 4: Crear Negocio con Propietario**

### **4.1 Configurar autorización ANTES de crear negocio**

**⚠️ AHORA SÍ configurar autorización**:
1. Click "Authorize" 🔒 en Swagger
2. Pegar token: `eyJhbGciOiJSUzI1NiIs...` (SIN "Bearer")
3. Click "Authorize"

### **4.2 Crear negocio completo con perfil de administrador**

**Endpoint**: `POST /api/businesses/with-owner`

**Body**:
```json
{
  "name": "Mi Negocio Test SA",
  "address": "Av. Corrientes 1234, CABA",
  "phone": "+5411-1234-5678",
  "owner_profile_name": "Administrador Principal",
  "owner_user_id": 1
}
```

**Response esperado**:
```json
{
  "business": {
    "business_id": 1,
    "owner_id": 1,
    "business_name": "Mi Negocio Test SA",
    "business_address": "Av. Corrientes 1234, CABA",
    "business_phone": "+5411-1234-5678",
    "cuil": null,
    "created_at": 1705450900000,
    "updated_at": 1705450900000
  },
  "profile": {
    "profile_id": 1,
    "business_id": 1,
    "profile_name": "Administrador Principal",
    "permissions": [
      {
        "service_id": 1,
        "can_get": true,
        "can_post": true,
        "can_put": true,
        "can_delete": true,
        "service": {
          "service_name": "users",
          "description": "Gestión de usuarios del sistema"
        }
      }
      // ... más permisos para todos los servicios
    ]
  }
}
```

### **4.3 Guardar datos del negocio**
- ✅ **business_id**: `1`
- ✅ **profile_id**: `1`

---

## **🛡️ PASO 5: Configurar Headers de Contexto**

### **5.1 Agregar headers para requests posteriores**

Para todos los endpoints que requieren contexto de negocio, agregar estos headers:

**Headers requeridos**:
```
x-business-id: 1
x-profile-id: 1
```

### **5.2 Cómo agregar headers en Swagger**

1. **Expandir cualquier endpoint** que requiera business context
2. **Buscar la sección "Parameters"**
3. **Completar los headers**:
   - `x-business-id`: `1`
   - `x-profile-id`: `1`

---

## **📦 PASO 6: Probar Funcionalidades del Negocio**

### **6.1 Crear un cliente**

**Endpoint**: `POST /api/customers`

**Headers**:
```
x-business-id: 1
x-profile-id: 1
```

**Body**:
```json
{
  "customer_name": "Cliente Test SA",
  "contact_name": "María González",
  "contact_phone": "+5411-9876-5432",
  "contact_email": "maria@cliente.com",
  "contact_location": "San Telmo, CABA",
  "contact_description": "Cliente corporativo principal"
}
```

### **6.2 Crear un proveedor**

**Endpoint**: `POST /api/suppliers`

**Headers**:
```
x-business-id: 1
x-profile-id: 1
```

**Body**:
```json
{
  "supplier_name": "Proveedor Test SRL",
  "contact_name": "Carlos Rodríguez",
  "contact_phone": "+5411-5555-1234",
  "contact_email": "carlos@proveedor.com",
  "contact_location": "Villa Crespo, CABA",
  "contact_description": "Proveedor de materias primas"
}
```

### **6.3 Crear un producto del negocio**

**Endpoint**: `POST /api/business-products`

**Headers**:
```
x-business-id: 1
x-profile-id: 1
```

**Body**:
```json
{
  "name": "Producto Test",
  "description": "Producto creado para testing",
  "code": "TEST-001",
  "creator_id": 1
}
```

---

## **📊 PASO 7: Verificar Datos Creados**

### **7.1 Listar todos los elementos creados**

**Obtener negocios del usuario**:
```
GET /api/businesses
```

**Obtener clientes del negocio**:
```
GET /api/customers
Headers: x-business-id: 1, x-profile-id: 1
```

**Obtener proveedores del negocio**:
```
GET /api/suppliers
Headers: x-business-id: 1, x-profile-id: 1
```

**Obtener productos del negocio**:
```
GET /api/business-products
Headers: x-business-id: 1, x-profile-id: 1
```

### **7.2 Verificar permisos**

**Obtener perfil del usuario**:
```
GET /api/profiles/{profile_id}
```

---

## **🔍 PASO 8: Testing Avanzado**

### **8.1 Probar diferentes usuarios**

1. **Crear otra cuenta** con `/api/auth/signup`
2. **Crear otro usuario** con `/api/users`
3. **Intentar acceder al negocio** sin permisos
4. **Verificar que se rechaza el acceso**

### **8.2 Probar validaciones**

**Intentar crear negocio con datos inválidos**:
```json
{
  "name": "",
  "owner_user_id": "invalid"
}
```

**Response esperado**: Error 400 con mensajes de validación

### **8.3 Probar autenticación**

1. **Remover el token** del botón "Authorize"
2. **Intentar hacer un request** a un endpoint protegido
3. **Verificar error 401**

---

## **🐛 PASO 9: Debugging con Logs**

### **9.1 Monitorear logs en tiempo real**

Si tienes acceso a los logs del servidor, verás:

```
📨 POST /api/auth/signup | User: Anonymous (N/A) | Business: N/A | Profile: N/A
✅ POST /api/auth/signup | 200 | 120ms | User: Anonymous

📨 POST /api/users | User: test@example.com (N/A) | Business: N/A | Profile: N/A
✅ POST /api/users | 201 | 85ms | User: test@example.com

📨 POST /api/businesses/with-owner | User: test@example.com (1) | Business: N/A | Profile: N/A
✅ POST /api/businesses/with-owner | 201 | 150ms | User: test@example.com

📨 POST /api/customers | User: test@example.com (1) | Business: 1 | Profile: 1
✅ POST /api/customers | 201 | 90ms | User: test@example.com
```

### **9.2 Verificar problemas comunes**

**Error de autenticación**:
```
❌ GET /api/customers | 401 | 15ms | User: Anonymous
```

**Error de permisos**:
```
❌ POST /api/customers | 403 | 20ms | User: test@example.com
```

**Request lento**:
```
⚠️ Slow Response: 2150ms for GET /api/products
```

---

## **✅ CHECKLIST COMPLETO**

### **Autenticación**
- [ ] ✅ Signup exitoso
- [ ] ✅ Token obtenido
- [ ] ✅ Autorización en Swagger configurada
- [ ] ✅ Health check responde OK

### **Gestión de Usuarios**
- [ ] ✅ Usuario creado en DB
- [ ] ✅ Firebase UID correcto
- [ ] ✅ Datos del usuario correctos

### **Gestión de Negocios**
- [ ] ✅ Negocio creado
- [ ] ✅ Perfil de administrador creado
- [ ] ✅ Permisos asignados correctamente
- [ ] ✅ Usuario asignado al perfil

### **Operaciones del Negocio**
- [ ] ✅ Cliente creado
- [ ] ✅ Proveedor creado
- [ ] ✅ Producto creado
- [ ] ✅ Headers de contexto funcionando

### **Verificaciones**
- [ ] ✅ Todos los GETs funcionan
- [ ] ✅ Datos relacionados correctamente
- [ ] ✅ Logs aparecen correctamente
- [ ] ✅ Validaciones funcionan

---

## **🆘 Solución de Problemas**

### **❌ Error 401: "Token no proporcionado"**
**Causa**: No configuraste autorización  
**Solución**: 
1. Click "Authorize" 🔒
2. Pegar token **SIN "Bearer"**: `eyJhbGciOiJSUzI1...`
3. Click "Authorize"
4. Verificar que dice "🔓 Authorized"

### **❌ Error 401: "Token inválido o expirado"**
**Causa**: Token expirado (duran 1 hora)  
**Solución**: 
1. Hacer nuevo login: `POST /api/auth/login`
2. Usar el nuevo `idToken`
3. Reconfigurar autorización

### **❌ Error 403: "Business ID requerido en headers"**
**Causa**: Falta header `x-business-id`  
**Solución**: 
1. Expandir el endpoint en Swagger
2. En "Parameters", agregar:
   - `x-business-id`: `1`
   - `x-profile-id`: `1`

### **❌ Error 403: "Sin permisos para este servicio"**
**Causa**: El perfil no tiene permisos para ese endpoint  
**Solución**: 
1. Usar perfil de administrador (creado con `with-owner`)
2. Verificar que `x-profile-id` sea correcto

### **❌ Error 400: "Validation failed"**
**Causa**: Datos inválidos en el body  
**Solución**: 
- Verificar campos requeridos
- Verificar tipos de datos (string, number)
- Revisar ejemplos en la documentación

### **❌ Error 500: "Error del servidor"**
**Causa**: Problema interno  
**Solución**: 
- Verificar logs del servidor
- Verificar conexión a base de datos
- Reportar el error

### **🔍 Verificar Configuración Correcta**

**✅ Authorization Header Correcto**:
El curl debe mostrar:
```bash
curl -X 'GET' \
  'http://localhost:8080/api/users' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1...'
```

**✅ Business Context Correcto**:
Para endpoints de negocio:
```bash
curl -X 'POST' \
  'http://localhost:8080/api/customers' \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1...' \
  -H 'x-business-id: 1' \
  -H 'x-profile-id: 1'
```

### **📝 Datos de Ejemplo para Testing**

**Usuario**:
```json
{
  "firebase_uid": "0eV4Z8gwi0PkNMhSddMzsk2PHKU2",
  "full_name": "Usuario Test"
}
```

**Negocio**:
```json
{
  "name": "Negocio Test SA",
  "address": "Av. Test 123, CABA", 
  "phone": "+5411-1234-5678",
  "owner_profile_name": "Administrador Principal",
  "owner_user_id": 1
}
```

**Cliente**:
```json
{
  "customer_name": "Cliente Test SA",
  "contact_name": "Juan Pérez",
  "contact_phone": "+5411-9876-5432",
  "contact_email": "juan@cliente.com",
  "contact_location": "San Telmo, CABA"
}
```

---

**🎯 ¡Con esta guía puedes probar toda la funcionalidad de la API de manera sistemática y completa!**
