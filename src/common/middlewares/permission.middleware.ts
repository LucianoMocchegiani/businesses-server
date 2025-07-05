import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

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
        
        // Extraer business_id y profile_id de los headers
        const businessId = req.headers['x-business-id'] as string;
        const profileId = req.headers['x-profile-id'] as string;
        
        // Agregar al request para que esté disponible en los controladores
        req.businessId = businessId ? parseInt(businessId) : undefined;
        req.profileId = profileId ? parseInt(profileId) : undefined;
        
        // Extraer serviceName correctamente - el índice 2: ['', 'api', 'serviceName']
        const urlParts = req.baseUrl.split('/');
        let serviceName = urlParts[2] || req.url.split('/')[2];
        
        // Limpiar query parameters del serviceName
        if (serviceName && serviceName.includes('?')) {
            serviceName = serviceName.split('?')[0];
        }

        // Rutas que requieren token pero NO requieren verificación de permisos
        const skipPermissionRoutes = [
            { method: 'POST', path: '/api/users' }, // Crear usuario
            { method: 'GET', path: '/api/profiles/user' }, // Obtener perfiles del usuario
            { method: 'POST', path: '/api/profiles' }, // Crear perfil
            { method: 'GET', path: '/api/profiles' }, // Listar perfiles
            { method: 'GET', path: '/api/services' }, // Listar servicios disponibles
            { method: 'GET', path: '/api/businesses/user' }, // Obtener negocios del usuario
            { method: 'POST', path: '/api/businesses/with-owner' }, // Crear negocio con owner
            { method: 'GET', path: '/api/businesses' } // Listar negocios
        ];

        // Verificar si es ruta que debe saltar verificación de permisos
        const shouldSkipPermissions = skipPermissionRoutes.some(route => {
            const methodMatches = req.method === route.method;
            const pathMatches = req.url.startsWith(route.path);
            return methodMatches && pathMatches;
        });

        if (shouldSkipPermissions) {
            return next();
        }

        // Verificar que vengan los headers requeridos para rutas que NO se saltan
        if (!businessId) {
            throw new ForbiddenException('Business ID requerido en headers (x-business-id)');
        }

        if (!profileId) {
            throw new ForbiddenException('Profile ID requerido en headers (x-profile-id)');
        }

        if (!userId) {
            throw new ForbiddenException('Usuario no especificado');
        }

        if (!serviceName) {
            throw new ForbiddenException('Servicio no especificado');
        }

        // Para rutas que requieren business context, verificar que se proporcionen los headers
        const requiresBusinessContext = !shouldSkipPermissions;
        if (requiresBusinessContext && !profileId) {
            throw new ForbiddenException('Profile ID requerido en headers (x-profile-id)');
        }

        // Si no se requiere contexto de negocio, continuar sin verificar permisos
        if (!requiresBusinessContext) {
            return next();
        }

        // Buscar el perfil específico y sus permisos
        const profile = await this.prisma.profile.findUnique({
            where: { profile_id: parseInt(profileId) },
            include: { 
                permissions: { 
                    include: { service: true } 
                },
                profileUsers: {
                    where: { user_id: userId }
                }
            },
        });

        if (!profile) {
            throw new ForbiddenException('Perfil no encontrado');
        }

        // Verificar que el usuario pertenece a este perfil
        if (profile.profileUsers.length === 0) {
            throw new ForbiddenException('No tienes acceso a este perfil');
        }

        // Busca el permiso para el servicio solicitado
        const permission = profile.permissions.find(
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
            throw new ForbiddenException(`No tienes permisos con el método ${req.method} para acceder al servicio: ${serviceName}`);
        }

        next();
    }
}