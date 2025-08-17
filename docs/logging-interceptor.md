# 📊 Interceptor de Logging - Monitoreo de APIs

## 📋 **Descripción**

El `LoggingInterceptor` registra automáticamente todas las consultas HTTP que llegan a la API, proporcionando información valiosa para debugging, monitoreo y auditoría.

## 🔧 **Configuración**

### **Variables de Entorno**

```bash
# Habilitar logging detallado (desarrollo)
ENABLE_DETAILED_LOGGING=true

# En producción se puede deshabilitar
ENABLE_DETAILED_LOGGING=false

# Por defecto, se habilita automáticamente en NODE_ENV=development
```

### **Registro Global**

El interceptor se registra automáticamente en `main.ts`:

```typescript
app.useGlobalInterceptors(
  new LoggingInterceptor(),
  new BigIntSerializationInterceptor()
);
```

## 📝 **Información Registrada**

### **Request Entrante**
```
📨 POST /api/users | User: user@example.com (123) | Business: 456 | Profile: 789
```

### **Response Exitoso**
```
✅ POST /api/users | 201 | 150ms | User: user@example.com
```

### **Response con Error**
```
❌ POST /api/users | 400 | 75ms | User: user@example.com
```

### **Response Lento**
```
⚠️ Slow Response: 3500ms for GET /api/products
```

## 🔍 **Detalles Loggeados**

### **Información Básica (Siempre)**
- **Método HTTP**: GET, POST, PUT, DELETE, etc.
- **URL**: Endpoint completo
- **Usuario**: Email e ID del usuario autenticado
- **Business ID**: ID del negocio en contexto
- **Profile ID**: ID del perfil en contexto
- **Tiempo de respuesta**: En milisegundos
- **Status Code**: 200, 404, 500, etc.

### **Información Detallada (Solo en Desarrollo)**
- **Request Body**: Datos enviados (sanitizados)
- **Headers importantes**: Content-Type, Origin, etc.
- **Response Body**: Solo en caso de errores

## 🛡️ **Seguridad y Sanitización**

### **Campos Sensibles Ocultos**
```typescript
// Antes (peligroso)
{ email: "user@example.com", password: "secret123" }

// Después (seguro)
{ email: "user@example.com", password: "[HIDDEN]" }
```

### **Campos Sanitizados**
- `password`
- `token`
- `secret`
- `key`
- `auth`

### **Headers Seguros**
```typescript
// Token completo NO se muestra
"authorization": "Bearer [TOKEN]"
```

## 🚫 **Rutas Excluidas**

Para evitar spam en los logs, ciertas rutas se filtran:

### **Completamente Excluidas**
- `/api/favicon.ico` - Requests de favicon
- Swagger UI assets (si son muy frecuentes)

### **Parcialmente Filtradas**
- `/api/health` - Solo se loggea 10% de requests (para monitoreo sin spam)

## 🎛️ **Niveles de Logging**

### **Por Status Code**
- **200-399**: `LOG` (verde) ✅
- **400-499**: `WARN` (amarillo) ⚠️
- **500+**: `ERROR` (rojo) ❌

### **Por Performance**
- **< 1s**: Normal
- **1-2s**: Aceptable
- **> 2s**: `WARN` - Response lento ⚠️

## 📊 **Ejemplos de Logs**

### **Login Exitoso**
```
📨 POST /api/auth/login | User: Anonymous (N/A) | Business: N/A | Profile: N/A
📝 Body: {"email":"user@example.com","password":"[HIDDEN]"}
✅ POST /api/auth/login | 200 | 120ms | User: Anonymous
```

### **Creación de Usuario**
```
📨 POST /api/users | User: admin@test.com (999) | Business: 123 | Profile: 456
📝 Body: {"first_name":"John","last_name":"Doe","email":"john@example.com"}
📋 Headers: {"content-type":"application/json","x-business-id":"123"}
✅ POST /api/users | 201 | 85ms | User: admin@test.com
```

### **Error de Autenticación**
```
📨 GET /api/users/profile | User: Anonymous (N/A) | Business: N/A | Profile: N/A
❌ GET /api/users/profile | 401 | 15ms | User: Anonymous
❌ Error Response: {"message":"Token no proporcionado","error":"Unauthorized"}
```

### **Query Lenta**
```
📨 GET /api/products?include_global=true | User: user@test.com (123) | Business: 456 | Profile: 789
✅ GET /api/products | 200 | 2150ms | User: user@test.com
⚠️ Slow Response: 2150ms for GET /api/products?include_global=true
```

## 🛠️ **Uso para Debugging**

### **Problemas de Autenticación**
Buscar logs con:
- `User: Anonymous` - Requests sin autenticar
- `401` - Tokens inválidos
- `Token no proporcionado` - Headers faltantes

### **Problemas de Performance**
Buscar logs con:
- `Slow Response` - Queries que tardan >2s
- Patrones de URLs que consumen mucho tiempo

### **Problemas de Datos**
- Revisar `Body:` en requests POST/PUT
- Verificar headers `x-business-id` y `x-profile-id`

## ⚙️ **Configuración Avanzada**

### **Customizar Rutas Excluidas**
Editar `shouldSkipLogging()` en `logging.interceptor.ts`:

```typescript
private shouldSkipLogging(url: string): boolean {
  const skipRoutes = [
    '/api/health',
    '/api/metrics',        // Agregar nueva ruta
    '/api/monitoring',     // Otra ruta a excluir
  ];
  
  return skipRoutes.some(route => url.startsWith(route));
}
```

### **Cambiar Campos Sanitizados**
Editar `sensitiveFields` en `sanitizeBody()`:

```typescript
const sensitiveFields = [
  'password', 'token', 'secret', 'key', 'auth',
  'ssn', 'credit_card', 'api_key'  // Agregar más campos
];
```

## 🔗 **Integración con Monitoreo**

### **Exportar a Servicios Externos**
El interceptor puede extenderse para enviar logs a:
- **Elasticsearch/Kibana**
- **Splunk**
- **DataDog**
- **New Relic**
- **CloudWatch**

### **Métricas Personalizadas**
Agregar contadores para:
- Requests por endpoint
- Tiempo promedio de respuesta
- Errores por tipo
- Usuarios más activos

## 📈 **Beneficios**

- ✅ **Debugging más fácil**: Ver exactamente qué datos llegan
- ✅ **Monitoreo de performance**: Identificar endpoints lentos
- ✅ **Auditoría de seguridad**: Quién accede a qué recursos
- ✅ **Troubleshooting rápido**: Logs estructurados y buscables
- ✅ **Análisis de uso**: Patrones de uso de la API

---

**💡 Tip**: En producción, configurar `ENABLE_DETAILED_LOGGING=false` para logs más limpios y mejor performance.
