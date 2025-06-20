# Documentación de Autenticación

## Introducción

Nuestro sistema utiliza **Firebase Authentication** para la autenticación de usuarios en el frontend y un middleware personalizado en el backend para validar y asociar los usuarios autenticados con los registros internos de la base de datos.

---

## Flujo de Autenticación

1. **Login en el Frontend**
   - El usuario inicia sesión utilizando Firebase Authentication (por ejemplo, con email y contraseña, Google, etc.).
   - Firebase devuelve un **ID Token** (JWT) al frontend.

2. **Envío del Token al Backend**
   - El frontend envía el ID Token de Firebase en el header `Authorization` con el formato:
     ```
     Authorization: Bearer <firebase_id_token>
     ```

3. **Verificación del Token en el Backend**
   - El backend utiliza el SDK de `firebase-admin` para verificar la validez del token recibido.
   - Si el token es válido, se extrae el `firebase_uid` del usuario autenticado.

4. **Asociación con el Usuario Interno**
   - El backend busca en la base de datos el usuario cuyo `firebase_uid` coincide con el del token.
   - Si el usuario existe, se adjunta al objeto `req.user` para su uso en middlewares y controladores posteriores.

5. **Acceso a Recursos Protegidos**
   - Los middlewares de autorización (por ejemplo, `PermissionMiddleware`) utilizan la información de `req.user` para controlar el acceso a los recursos según los permisos y perfiles definidos.

---

## Ventajas del Enfoque

- **Seguridad:** El backend nunca maneja contraseñas, solo tokens firmados por Firebase.
- **Escalabilidad:** Permite soportar múltiples métodos de autenticación (email, Google, etc.) sin cambios en el backend.
- **Centralización:** El control de acceso se realiza en el backend, permitiendo reglas y permisos personalizados.

---

## Requisitos

- El frontend debe autenticar usuarios con Firebase y enviar el ID Token en cada petición protegida.
- El backend debe tener inicializado `firebase-admin` con las credenciales de servicio.
- El modelo `User` en la base de datos debe tener el campo `firebase_uid` único.

---

## Ubicación de Código

- **Middleware de autenticación:**  
  `src/common/middlewares/auth.middleware.ts`
- **Inicialización de Firebase Admin:**  
  (Por ejemplo) `src/firebase/firebase-admin.ts`
- **Modelos Prisma:**  
  `prisma/schema.prisma`

---

## Resumen

El sistema garantiza que solo usuarios autenticados por Firebase puedan acceder a los recursos protegidos, y asocia cada usuario autenticado con su registro interno para aplicar reglas y permisos personalizados.