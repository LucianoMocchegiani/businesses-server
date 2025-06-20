import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
    interface Request {
        user?: { user_id: number;[key: string]: any };
    }
}

/**
 * PermissionMiddleware
 * 
 * Este middleware de NestJS verifica si el usuario autenticado tiene permisos para acceder
 * a un servicio específico según su perfil y el método HTTP de la petición.
 * 
 * ¿Cómo funciona?
 * 
 * 1. Obtención de usuario y servicio:
 *    - El middleware espera que el usuario autenticado esté disponible en req.user
 *      (por ejemplo, tras un middleware de autenticación).
 *    - El nombre del servicio se extrae de la ruta (req.baseUrl.split('/')[1]).
 * 
 * 2. Búsqueda del perfil y permisos:
 *    - Consulta la base de datos para obtener el perfil del usuario y sus permisos asociados.
 *    - Busca el permiso correspondiente al servicio solicitado.
 * 
 * 3. Verificación de permisos:
 *    - Mapea el método HTTP (GET, POST, PUT, DELETE) al campo de permiso (can_get, can_post, etc.).
 *    - Si el permiso no existe o no está habilitado para ese método, lanza una excepción ForbiddenException.
 * 
 * 4. Permite o deniega el acceso:
 *    - Si el usuario tiene el permiso adecuado, la petición continúa.
 *    - Si no, la petición es rechazada con un error 403.
 * 
 * Ejemplo de uso:
 * 
 * Registra el middleware en tu módulo principal o en módulos específicos usando el método configure del módulo:
 * 
 *   consumer
 *     .apply(PermissionMiddleware)
 *     .forRoutes({ path: 'users', method: RequestMethod.ALL });
 * 
 * Requisitos:
 * - El usuario debe estar autenticado y disponible en req.user.
 * - Los modelos de base de datos deben incluir relaciones entre usuario, perfil y permisos.
 * - El nombre del servicio debe coincidir con el campo service_name en la base de datos.
 * 
 * Ubicación:
 * src/common/middlewares/permission.middleware.ts
 * 
 * Propósito:
 * Controlar el acceso a rutas según los permisos del perfil del usuario y el método HTTP.
 */

@Injectable()
export class PermissionMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        const userId = req.user?.user_id;
        const serviceName = req.baseUrl.split('/')[1];

        if (!userId || !serviceName) {
            throw new ForbiddenException('Usuario o servicio no especificado');
        }

        // Busca el perfil del usuario
        const profileUser = await this.prisma.profileUser.findFirst({
            where: { user_id: userId },
            include: { profile: { include: { permissions: { include: { service: true } } } } },
        });

        if (!profileUser) {
            throw new ForbiddenException('Perfil de usuario no encontrado');
        }

        // Busca el permiso para el servicio solicitado
        const permission = profileUser.profile.permissions.find(
            (perm) => perm.service.service_name === serviceName
        );

        // Mapea el método HTTP al campo de permiso
        const method = req.method.toLowerCase();
        let hasPermission = false;
        if (permission) {
            if (method === 'get') hasPermission = permission.can_get;
            else if (method === 'post') hasPermission = permission.can_post;
            else if (method === 'put') hasPermission = permission.can_put;
            else if (method === 'delete') hasPermission = permission.can_delete;
        }

        if (!hasPermission) {
            throw new ForbiddenException('No tienes permisos para acceder a este servicio');
        }

        next();
    }
}