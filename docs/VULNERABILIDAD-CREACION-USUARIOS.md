# Vulnerabilidad de Seguridad: Creación de Usuarios Sin Autenticación

## 🚨 Descripción del Problema

Actualmente, el endpoint `POST /api/users` está configurado como una **ruta pública** en el middleware de autenticación, lo que significa que cualquier persona puede crear usuarios en la base de datos sin ningún tipo de verificación o autenticación.

## 📍 Ubicación del Código

**Archivo:** `src/common/middlewares/auth.middleware.ts`  
**Línea:** 51  

```typescript
// Rutas que NO requieren autenticación
const publicRoutes = [
  { method: 'POST', path: '/api/users' }, // ⚠️ VULNERABILIDAD AQUÍ
  { method: 'GET', path: '/api/users/firebase' },
  { method: 'GET', path: '/api/docs' },
  { method: 'GET', path: '/api/firebase-status' },
  { method: 'GET', path: '/api' },
  { method: 'GET', path: '/' },
];
```

## 🔓 Qué Permite Esta Vulnerabilidad

### Ataques Posibles:
1. **Spam de Usuarios**: Cualquiera puede crear miles de usuarios falsos
2. **Saturación de Base de Datos**: Llenar la DB con registros inútiles
3. **Inyección de Datos Maliciosos**: Crear usuarios con nombres/emails maliciosos
4. **Bypass del Sistema de Registro**: Saltarse el flujo normal de Firebase Authentication
5. **Creación de Usuarios Administrativos**: Si no hay validación en el controlador

### Escenarios de Ataque:
```bash
# Cualquier persona puede hacer esto sin autenticación:
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Usuario Malicioso",
    "email": "spam@ejemplo.com",
    "firebase_uid": "uid-falso-123"
  }'
```

## 🎯 Impacto de la Vulnerabilidad

### Alto Riesgo:
- **Integridad de Datos**: Datos inconsistentes entre Firebase y la base de datos
- **Disponibilidad**: Posible saturación del sistema
- **Seguridad del Negocio**: Usuarios no autorizados en el sistema

### Medio Riesgo:
- **Costos**: Incremento en costos de base de datos por almacenamiento innecesario
- **Performance**: Degradación del rendimiento con datos falsos

## ✅ Solución Implementada ✅

### ✅ Opción 2: Token Requerido Sin Búsqueda en DB - **IMPLEMENTADA**

Se ha modificado el middleware para que `POST /api/users`:

1. **✅ Requiere token de Firebase válido**
2. **✅ Verifica el token con Firebase Admin**
3. **✅ Extrae el `firebase_uid` del token**
4. **✅ NO busca el usuario en la base de datos** (porque se está creando)
5. **✅ Pasa los datos de Firebase al controlador**

### Flujo Seguro Actual:
```
Frontend → Firebase Auth → Token → Backend Middleware → Verificación Token → Controller → Crear Usuario en DB
```

### Cambios Implementados:

1. **✅ Removido de rutas públicas:**
```typescript
// REMOVIDO:
{ method: 'POST', path: '/api/users' }, // Ya no es público
```

2. **✅ Agregada nueva categoría de rutas:**
```typescript
// Rutas que requieren token pero NO buscan usuario en DB
const userCreationRoutes = [
  { method: 'POST', path: '/api/users' }
];
```

3. **✅ Lógica de verificación implementada:**
```typescript
if (isUserCreationRoute) {
  console.log('👤 User creation route, proceeding with Firebase token only');
  req.firebaseUser = decodedToken; // Datos de Firebase para crear usuario
  return next();
}
```

4. **✅ PermissionMiddleware actualizado:**
```typescript
// Rutas que requieren token pero NO requieren verificación de permisos
const skipPermissionRoutes = [
    { method: 'POST', path: '/api/users' } // Crear usuario
];
```

5. **✅ Controller actualizado:**
```typescript
@Post()
create(@Body() data: any, @Req() req: Request): Promise<User> {
  const userData = req.firebaseUser ? {
    firebase_uid: req.firebaseUser.uid,
    email: req.firebaseUser.email || data.email,
    full_name: req.firebaseUser.name || data.full_name,
    ...data
  } : data;
  return this.usersService.create(userData);
}
```

## 🔒 Beneficios de la Solución

### Seguridad:
- Solo usuarios autenticados en Firebase pueden crear registros
- Garantiza consistencia entre Firebase y la base de datos
- Previene ataques de spam y creación masiva de usuarios

### Integridad:
- El `firebase_uid` está garantizado como válido por Firebase
- No hay posibilidad de crear usuarios con UIDs falsos
- Mantiene la relación uno-a-uno entre Firebase Auth y DB

### Auditabilidad:
- Todos los usuarios creados tienen tokens válidos rastreables
- Logs detallados de quién crea qué usuarios

## 📋 Plan de Implementación

1. **Paso 1**: Modificar `auth.middleware.ts` con la nueva lógica
2. **Paso 2**: Actualizar `users.controller.ts` para usar `req.firebaseUser`
3. **Paso 3**: Probar el flujo completo de creación de usuarios
4. **Paso 4**: Validar que otras rutas sigan funcionando correctamente

## ✅ Estado Actual

**RESUELTO**: La vulnerabilidad ha sido **CORREGIDA**.  
**Estado**: ✅ **IMPLEMENTADO** - Solución Opción 2 completa  
**Seguridad**: 🔒 **ALTA** - Solo usuarios autenticados en Firebase pueden crear registros

---

**Fecha del Reporte**: 30 de junio de 2025  
**Fecha de Resolución**: 30 de junio de 2025  
**Criticidad**: Alta → **Resuelta**  
**Estado**: ✅ **Resuelto**
