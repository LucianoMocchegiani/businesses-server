# 🚀 Configuración del Proyecto y Scripts - Businesses Server

Esta documentación cubre todo lo necesario para configurar e inicializar el proyecto Businesses Server, así como la documentación completa de todos los scripts disponibles.

## 📋 Prerrequisitos

- [Node.js](https://nodejs.org/) versión 18 o superior
- [Docker](https://www.docker.com/products/docker-desktop/) instalado y funcionando
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/) como gestor de paquetes
- Archivo `.env` configurado en la raíz del proyecto

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```properties
# Base de datos (para contenedores Docker)
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/businesses

# Firebase (obtener de Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Puerto de la aplicación
PORT=8080

# Entorno
NODE_ENV=development

# Logging detallado (opcional - por defecto true en development)
ENABLE_DETAILED_LOGGING=true
```

### 2. Configuración de Base de Datos PostgreSQL

```powershell
# Crear y ejecutar contenedor PostgreSQL
docker run --name postgres-businesses `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=businesses `
  -p 5432:5432 `
  -d postgres:15

# Verificar que esté corriendo
docker ps
```

### 3. Inicialización del Proyecto

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones iniciales
npm run db:migrate

# Iniciar aplicación en desarrollo
npm run start:dev
```

## 🐳 Configuración con Docker

### Construcción de la Imagen

```powershell
# Construir imagen de la aplicación
docker build -t businesses-server .

# Ejecutar aplicación con Docker
docker run -p 8080:8080 --env-file .env businesses-server
```

### Comandos Docker Útiles

```powershell
# Ver contenedores activos
docker ps

# Detener contenedor
docker stop <CONTAINER_ID>

# Iniciar contenedor detenido
docker start postgres-businesses

# Ver logs del contenedor
docker logs postgres-businesses

# Eliminar contenedor
docker rm postgres-businesses
```

## 📚 Scripts Disponibles

### 🚀 Scripts de Aplicación

#### Desarrollo y Testing

```bash
# Compilar la aplicación TypeScript
npm run build

# Formatear código usando Prettier
npm run format

# Iniciar aplicación en modo desarrollo (con watch)
npm run start:dev

# Iniciar aplicación básica (sin watch)
npm run start

# Iniciar en modo debug (puerto 9229)
npm run start:debug

# Ejecutar tests unitarios
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:cov

# Debug de tests
npm run test:debug

# Ejecutar tests end-to-end
npm run test:e2e

# Linting y corrección automática
npm run lint
```

#### Producción

```bash
# Iniciar aplicación compilada para producción
npm run start:prod

# Iniciar con migraciones automáticas (para despliegue)
npm run start:prod:migrate
```

### 🗄️ Scripts de Base de Datos

#### ⚠️ Importante: Diferencia entre Scripts Locales vs Docker

**Scripts Locales (`db:*`)**: Usan `localhost:5432` - para herramientas de desarrollo
**Variables de entorno (.env)**: Usan `host.docker.internal:5432` - para contenedores Docker

#### Scripts Locales (Desarrollo)

```bash
# 🎨 Abrir Prisma Studio (interfaz visual)
npm run db:studio
# → Abre http://localhost:5555
# → Conexión: localhost:5432

# 📊 Ver datos desde terminal
npm run db:debug
# → Muestra resumen de datos en consola
# → Conexión: localhost:5432

# 🔄 Generar cliente Prisma
npm run db:generate
# → Regenera types y cliente después de cambios en schema
# → Conexión: localhost:5432

# 📥 Importar schema desde DB existente
npm run db:pull
# → Actualiza prisma/schema.prisma basado en la DB
# → Conexión: localhost:5432

# 📤 Sincronizar schema con DB (sin migraciones)
npm run db:push
# → Aplica cambios directamente a la DB
# → ⚠️ Puede perder datos - solo para desarrollo
# → Conexión: localhost:5432

# 🚀 Aplicar migraciones en desarrollo
npm run db:migrate
# → Crea y aplica nuevas migraciones
# → Pregunta por nombre de migración
# → Conexión: localhost:5432
```

#### Cuándo usar cada script:

| Script | Cuándo usarlo | Conexión |
|--------|---------------|----------|
| `db:studio` | Ver/editar datos visualmente | localhost |
| `db:debug` | Debug rápido en terminal | localhost |
| `db:generate` | Después de cambiar schema | localhost |
| `db:pull` | Importar schema de DB existente | localhost |
| `db:push` | Desarrollo rápido (sin migraciones) | localhost |
| `db:migrate` | Crear migraciones para cambios | localhost |
| `db:seed` | Insertar datos iniciales | localhost |

## 📋 Flujos de Trabajo

### 1. Configuración Inicial Completa

```bash
# Paso 1: Configurar base de datos
docker run -d --name postgres-businesses \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=businesses \
  -p 5432:5432 postgres:15

# Paso 2: Instalar dependencias
npm install

# Paso 3: Configurar Prisma
npm run db:generate
npm run db:migrate

# Paso 4: Ejecutar seed de datos
npm run db:seed

# Paso 5: Verificar configuración
npm run db:studio  # Abrir interfaz visual
npm run db:debug   # Ver datos en terminal

# Paso 5: Iniciar desarrollo
npm run start:dev
```

### 2. Desarrollo Diario

```bash
# Iniciar base de datos (si no está corriendo)
docker start postgres-businesses

# Ver datos visualmente
npm run db:studio

# Desarrollo del backend
npm run start:dev

# Ejecutar tests (en otra terminal)
npm run test:watch
```

### 3. Cambios en Schema de Base de Datos

```bash
# Opción A: Desarrollo rápido (sin migraciones)
# 1. Editar prisma/schema.prisma
# 2. Aplicar cambios directamente
npm run db:push
# 3. Regenerar cliente
npm run db:generate

# Opción B: Con migraciones (recomendado para producción)
# 1. Editar prisma/schema.prisma
# 2. Crear migración
npm run db:migrate
# 3. Regenerar cliente (automático con migrate)
```

## 🌱 Seed de Datos

### ¿Qué es el Seed?

El seed es un proceso que inserta datos iniciales en la base de datos, como servicios básicos del sistema, categorías por defecto, etc.

### Scripts de Seed

```bash
# Ejecutar seed manualmente
npm run db:seed

# Reset completo + seed automático
npx prisma migrate reset
```

### Configuración Automática

El seed se ejecuta automáticamente en estos casos:
- ✅ `npx prisma migrate reset` - **SÍ ejecuta seed**
- ✅ `npx prisma db seed` - **SÍ ejecuta seed**
- ❌ `npx prisma migrate dev` - **NO ejecuta seed**
- ❌ `npx prisma db push` - **NO ejecuta seed**

### Datos que se insertan

El archivo `prisma/seed.sql` inserta:
- Servicios básicos del sistema (users, products, sales, etc.)
- Configuraciones iniciales necesarias para el funcionamiento

### Para Docker/Producción

En entornos Docker, el seed debe ejecutarse en runtime, NO en build:

```yaml
# docker-compose.yml (Recomendado)
services:
  app:
    command: sh -c "npx prisma migrate deploy && npx prisma db seed && npm run start:prod"
    depends_on:
      db:
        condition: service_healthy
```

```bash
# Script de inicio (Alternativa)
#!/bin/bash
npx prisma migrate deploy
npx prisma db seed
npm run start:prod
```

### Verificar Seed

```bash
# Verificar que los servicios se insertaron
npm run db:studio
# → Ir a tabla "Service" → Debería tener 10 registros

# Verificar desde terminal
npm run db:debug
# → Muestra resumen incluyendo servicios
```
```

### 4. Despliegue en Producción

```bash
# Compilar aplicación
npm run build

# Ejecutar con migraciones automáticas
npm run start:prod:migrate

# O ejecutar en Docker
docker run -p 8080:8080 --env-file .env businesses-server
```

## 🔧 Configuración de Conexiones

### Variables de Entorno (.env)
```properties
# Para contenedores Docker
DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/businesses
```

### Scripts Locales (Override automático)
```bash
# Los scripts db:* usan internamente:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/businesses
```

## 🛠️ Troubleshooting

### Error de conexión en scripts locales

```bash
# Verificar que PostgreSQL esté corriendo
docker ps

# Si no está corriendo, iniciarlo
docker start postgres-businesses

# Si no existe, recrear contenedor
docker run -d --name postgres-businesses \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=businesses \
  -p 5432:5432 postgres:15
```

### Error "User was denied access"

```bash
# Verificar conexión con pull
npm run db:pull

# Si falla, recrear contenedor PostgreSQL
docker stop postgres-businesses
docker rm postgres-businesses
docker run -d --name postgres-businesses \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=businesses \
  -p 5432:5432 postgres:15

# Volver a aplicar migraciones
npm run db:migrate
```

### Prisma Studio no abre

```bash
# Generar cliente primero
npm run db:generate

# Luego intentar studio
npm run db:studio

# Si persiste, verificar conexión a DB
npm run db:debug
```

### Errores de TypeScript después de cambios en schema

```bash
# Regenerar cliente Prisma
npm run db:generate

# Recompilar aplicación
npm run build

# Reiniciar desarrollo
npm run start:dev
```

### Puerto 8080 ya en uso

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# Cambiar puerto en .env
PORT=3000

# O detener proceso existente
docker stop <container-usando-8080>
```

## 🔍 Scripts de Debug

### Debug de Base de Datos

```bash
# Ver resumen completo de datos
npm run db:debug

# Ver servicios específicos (ejemplo)
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.service.findMany().then(console.log).finally(() => prisma.\$disconnect());
"
```

### Debug de Aplicación

```bash
# Ver logs detallados de Prisma
DEBUG=prisma:* npm run start:dev

# Debug con inspector de Node.js
npm run start:debug
# Conectar en chrome://inspect

# Ver logs de contenedor Docker
docker logs postgres-businesses -f
```

## 🚀 Configuración para Producción

### Google Cloud Run

```yaml
# cloudbuild.yaml ejemplo
steps:
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
  
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/businesses-server', '.']
    
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/businesses-server']
    
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: ['run', 'deploy', 'businesses-server', 
           '--image', 'gcr.io/$PROJECT_ID/businesses-server',
           '--platform', 'managed',
           '--region', 'us-central1']
```

### Variables de Entorno para Producción

```properties
DATABASE_URL=postgresql://user:password@prod-host:5432/businesses
NODE_ENV=production
PORT=8080
FIREBASE_PROJECT_ID=your-prod-project-id
# ... otras variables de Firebase para producción
```

## 📝 Notas Importantes

1. **Scripts `db:*`**: Siempre usan `localhost:5432` para desarrollo local
2. **Variables .env**: Configuradas para Docker con `host.docker.internal:5432`
3. **Prisma Studio**: Solo funciona con conexión localhost
4. **Migraciones**: Usar `db:migrate` en desarrollo y producción
5. **db:push**: Solo para desarrollo rápido, puede perder datos
6. **Backup**: Siempre hacer backup antes de cambios importantes en schema
7. **Testing**: Ejecutar tests antes de hacer push a repositorio
8. **Docker**: Usar `start:prod:migrate` para despliegues automatizados

## 🔗 Enlaces Útiles

- **Prisma Studio**: http://localhost:5555 (cuando esté corriendo)
- **API Swagger**: http://localhost:8080/api (cuando la app esté corriendo)
- **Health Check**: http://localhost:8080/health
- **Prisma Docs**: https://www.prisma.io/docs/
- **NestJS Docs**: https://docs.nestjs.com/ 