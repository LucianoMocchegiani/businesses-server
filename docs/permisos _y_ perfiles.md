# Documentación de Manejo de Permisos y Perfiles

## Introducción

Nuestro sistema implementa un control de acceso basado en **perfiles** y **permisos** asociados a **servicios**. Esto permite definir qué acciones puede realizar cada usuario según su perfil y el servicio al que intenta acceder.

---

## Conceptos Clave

### Usuario (`User`)
- Representa a una persona que puede acceder al sistema.
- Puede estar asociado a uno o varios perfiles mediante la entidad `ProfileUser`.

### Perfil (`Profile`)
- Define un conjunto de permisos para un grupo de usuarios.
- Cada perfil pertenece a un negocio (`Business`).
- Un usuario puede tener varios perfiles (por ejemplo, en diferentes negocios).

### Servicio (`Service`)
- Representa un módulo o recurso del sistema (por ejemplo: `users`, `products`, `sales`).
- Cada servicio tiene un nombre único (`service_name`).

### Permiso (`Permission`)
- Define las acciones permitidas de un perfil sobre un servicio.
- Acciones posibles: `can_get`, `can_post`, `can_put`, `can_delete`.
- Cada permiso vincula un perfil con un servicio.

### Relación Usuario-Perfil (`ProfileUser`)
- Relaciona un usuario con un perfil específico.

---

## Flujo de Autorización

1. **Autenticación:**  
   El usuario se autentica y su información (incluyendo `user_id` y perfiles) se adjunta al objeto `req.user`.

2. **Identificación del Servicio:**  
   El middleware extrae el nombre del servicio de la ruta solicitada (por ejemplo, `/api/users` → `users`).

3. **Obtención de Perfil y Permisos:**  
   Se consulta la base de datos para obtener el perfil activo del usuario y los permisos asociados a ese perfil.

4. **Verificación de Permiso:**  
   El middleware compara el método HTTP de la petición (`GET`, `POST`, `PUT`, `DELETE`) con los campos de permiso (`can_get`, etc.) para el servicio solicitado.

5. **Acceso o Denegación:**  
   - Si el permiso existe y está habilitado, la petición continúa.
   - Si no, se responde con un error 403 (Forbidden).

---

## Ejemplo de Estructura de Permisos

| Perfil      | Servicio | can_get | can_post | can_put | can_delete |
|-------------|----------|---------|----------|---------|------------|
| Admin       | users    |   ✔     |    ✔     |   ✔     |     ✔      |
| Vendedor    | sales    |   ✔     |    ✔     |         |            |
| Invitado    | users    |   ✔     |          |         |            |

---

## Ejemplo de Middleware

El middleware `PermissionMiddleware` se encarga de este control de acceso.  
Se registra en los módulos deseados y actúa antes de cada petición protegida.

```typescript
consumer
  .apply(PermissionMiddleware)
  .forRoutes({ path: 'users', method: RequestMethod.ALL });
```

### Requisitos Técnicos

- El usuario debe estar autenticado y disponible en `req.user`.
- Los modelos de base de datos deben incluir las relaciones entre usuario, perfil, permiso y servicio.
- El nombre del servicio en la ruta debe coincidir con el campo `service_name` en la base de datos.

### Ubicación de Código

- **Modelos Prisma:**  
  `prisma/schema.prisma`
- **Middleware:**  
  `src/common/middlewares/permission.middleware.ts`

### Propósito

Controlar el acceso a los recursos del sistema de forma flexible y escalable, permitiendo definir roles y permisos detallados para cada