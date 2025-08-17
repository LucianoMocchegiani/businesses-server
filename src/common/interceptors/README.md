# Interceptores

Este directorio contiene interceptores personalizados para la aplicación.

## BigIntSerializationInterceptor

### Problema Resuelto

El error `TypeError: Do not know how to serialize a BigInt` ocurre cuando Prisma devuelve campos de tipo `bigint` que no pueden ser serializados directamente con `JSON.stringify()`.

### Solución

El `BigIntSerializationInterceptor` es un interceptor global que:

1. **Intercepta todas las respuestas** antes de que sean serializadas a JSON
2. **Convierte automáticamente** todos los valores `BigInt` a `Number`
3. **Maneja objetos anidados** y arrays recursivamente
4. **Convierte objetos Date** a timestamps (milisegundos)

### Características

- ✅ Conversión automática de BigInt a Number
- ✅ Manejo recursivo de objetos y arrays
- ✅ Conversión de objetos Date a timestamps
- ✅ Preservación de valores null y undefined
- ✅ Aplicación global a todas las rutas

### Uso

El interceptor se registra globalmente en `main.ts`:

```typescript
// Global interceptor for BigInt serialization
app.useGlobalInterceptors(new BigIntSerializationInterceptor());
```

### Ejemplo

**Antes (causa error):**
```typescript
{
  id: 123,
  created_at: BigInt(1234567890),  // ❌ Error de serialización
  updated_at: BigInt(9876543210)   // ❌ Error de serialización
}
```

**Después (funciona correctamente):**
```typescript
{
  id: 123,
  created_at: 1234567890,  // ✅ Número serializable
  updated_at: 9876543210   // ✅ Número serializable
}
```

### Campos Afectados

Los campos más comunes que se transforman automáticamente:

- `created_at`
- `updated_at`
- `entry_date`
- `expiration_date`
- `valid_from`
- `valid_to`
- Cualquier campo de tipo `bigint` en la base de datos

### Pruebas

Las pruebas unitarias están en `bigint-serialization.interceptor.spec.ts` y cubren:

- Conversión básica de BigInt a Number
- Objetos anidados con BigInt
- Arrays con BigInt
- Objetos Date
- Valores null y undefined
- Casos edge

### Notas Importantes

1. **Pérdida de precisión**: Los BigInt muy grandes pueden perder precisión al convertirse a Number
2. **Rango seguro**: Para la mayoría de casos de uso (timestamps, IDs), el rango de Number es suficiente
3. **Aplicación global**: Se aplica a todas las respuestas de la API automáticamente
4. **Sin configuración adicional**: No requiere cambios en los controladores o servicios existentes 