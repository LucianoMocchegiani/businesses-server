# Estructura del Proyecto `businesses-server`
```
businesses-server/  
├── config/ # Configuración adicional del proyecto 
├── dist/ # Archivos compilados (output de TypeScript) 
├── docs/ # Documentación del proyecto 
├── node_modules/ # Dependencias de Node.js 
├── prisma/ # Archivos de Prisma (schema.prisma, migraciones, seeds) 
├── src/ # Código fuente principal de la aplicación 
    ├── brands/ # Módulo para marcas 
    ├── business-products/ # Módulo para productos de negocio 
    ├── businesses/ # Módulo para negocios 
    ├── categories/ # Módulo para categorías 
    ├── common/ # Utilidades y recursos compartidos 
    ├── customers/ # Módulo para clientes 
    ├── firebase/ # Configuración y utilidades de Firebase 
    ├── global-products/ # Módulo para productos globales 
    ├── inventories/ # Módulo para inventarios 
    ├── nest/ # Configuración específica de NestJS 
    ├── prisma/ # Servicio de Prisma y migraciones 
    ├── purchases/ # Módulo para compras 
    ├── sales/ # Módulo para ventas 
    ├── suppliers/ # Módulo para proveedores 
    ├── users/ # Módulo para usuarios 
    ├── app.controller.ts # Controlador principal de la app 
    ├── app.module.ts # Módulo raíz de la aplicación 
    ├── app.service.ts # Servicio principal de la app 
    ├── main.ts # Punto de entrada de la aplicación
├── test/ # Pruebas unitarias y de integración  
├── .dockerignore # Archivos/carpetas ignorados por Docker 
├── .env # Variables de entorno (NO subir a repositorios públicos) 
├── .gitignore # Archivos/carpetas ignorados por Git 
├── .prettierrc # Configuración de Prettier 
├── Dockerfile # Instrucciones para construir la imagen Docker 
├── eslint.config.mjs # Configuración de ESLint 
├── nest-cli.json # Configuración de NestJS CLI 
├── package-lock.json # Lockfile de npm 
├── package.json # Dependencias y scripts del proyecto 
├── README.md # Documentación principal del proyecto 
├── tsconfig.build.json # Configuración de TypeScript para build 
├── tsconfig.json # Configuración general de TypeScript
```
**Notas:**
- El directorio `src/` contiene los módulos, controladores, servicios y lógica principal de la app.
  - **Estructura típica de un módulo en `src/`:**
    ```
    modulo/
    ├── modulo.controller.ts   # Define los endpoints HTTP del módulo
    ├── modulo.service.ts      # Contiene la lógica de negocio y acceso a datos
    └── modulo.module.ts       # Declara el módulo y sus dependencias en NestJS
    ```
- El directorio `prisma/` contiene el esquema de base de datos y migraciones.
- El archivo `.env` almacena las variables sensibles y de configuración.
- El directorio `docs/` es ideal para documentación adicional y