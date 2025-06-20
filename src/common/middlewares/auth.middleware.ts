import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import admin from '../../firebase/firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AuthMiddleware
 * 
 * Este middleware de NestJS autentica a los usuarios utilizando Firebase Authentication
 * y asocia el usuario autenticado con el registro correspondiente en la base de datos.
 * 
 * ¿Cómo funciona?
 * 1. Obtención del token:
 *    - El middleware espera que el frontend envíe el token de Firebase en el header Authorization
 *      con el formato 'Bearer <token>'.
 * 2. Verificación del token:
 *    - Utiliza el SDK de firebase-admin para verificar la validez del token recibido.
 *    - Si el token es válido, obtiene el firebase_uid del usuario autenticado.
 * 3. Búsqueda del usuario en la base de datos:
 *    - Busca el usuario en la base de datos usando el campo firebase_uid.
 *    - Si el usuario existe, lo adjunta al objeto req.user para que esté disponible en los siguientes middlewares y controladores.
 * 4. Manejo de errores:
 *    - Si el token no está presente, es inválido, expiró o el usuario no existe en la base de datos,
 *      lanza una excepción UnauthorizedException (HTTP 401).
 * 
 * Ejemplo de uso:
 * consumer
 *   .apply(AuthMiddleware)
 *   .forRoutes({ path: '*', method: RequestMethod.ALL });
 * 
 * Requisitos:
 * - El frontend debe enviar el token de Firebase en el header Authorization.
 * - Debes tener inicializado firebase-admin en tu backend con las credenciales de servicio de Firebase.
 * - El modelo User en tu base de datos debe tener el campo firebase_uid único.
 * 
 * Ubicación:
 * src/common/middlewares/auth.middleware.ts
 * 
 * Propósito:
 * Autenticar usuarios mediante Firebase Authentication y asociarlos con los registros de usuario en la base de datos,
 * permitiendo así un control de acceso seguro y centralizado en el backend.
 */

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // Verifica el token de Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedToken.uid;

      // Busca el usuario en tu base de datos usando el firebase_uid
      const user = await this.prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      req.user = user;
      next();
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}