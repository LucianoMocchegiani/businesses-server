# 📚 Documentación de Scripts - Businesses Server

Esta documentación explica todos los scripts disponibles en el `package.json` del backend, organizados por categorías para facilitar su uso.

## 🚀 Scripts de Aplicación

### Desarrollo y Testing

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

### Producción

```bash
# Iniciar aplicación compilada para producción
npm run start:prod

# Iniciar con migraciones automáticas (para despliegue)
npm run start:prod:migrate
```

## 🗄️ Scripts de Base de Datos

### ⚠️ Importante: Diferencia entre Scripts Locales vs Docker

**Scripts Locales (`db:*`)**: Usan `localhost:5432` - para herramientas de desarrollo
**Variables de entorno (.env)**: Usan `host.docker.internal:5432` - para contenedores Docker

### Scripts Locales (Desarrollo)

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

### Cuándo usar cada script:

| Script | Cuándo usarlo | Conexión |
|--------|---------------|----------|
| `db:studio` | Ver/editar datos visualmente | localhost |
| `db:debug` | Debug rápido en terminal | localhost |
| `db:generate` | Después de cambiar schema | localhost |
| `db:pull` | Importar schema de DB existente | localhost |
| `db:push` | Desarrollo rápido (sin migraciones) | localhost |
| `db:migrate` | Crear migraciones para cambios | localhost |

## 🐳 Scripts para Docker

### Contenedores

```bash
# Ejecutar backend en contenedor
docker run -p 8080:8080 --env-file .env businesses-server
# → Usa host.docker.internal:5432 (del .env)

# Ejecutar con migraciones automáticas
npm run start:prod:migrate
# → Para despliegue en producción
# → Ejecuta migraciones antes de iniciar
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

## 📋 Flujo de Trabajo Recomendado

### 1. Desarrollo Local
```bash
# Iniciar PostgreSQL
docker run -d --name postgres-businesses -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=businesses -p 5432:5432 postgres:13

# Ver datos visualmente
npm run db:studio

# Ver datos en terminal
npm run db:debug

# Desarrollo del backend
npm run start:dev
```

### 2. Cambios en Schema
```bash
# Opción A: Desarrollo rápido (sin migraciones)
npm run db:push

# Opción B: Con migraciones (recomendado)
# 1. Editar prisma/schema.prisma
# 2. Crear migración
npm run db:migrate
# 3. Regenerar cliente
npm run db:generate
```

### 3. Despliegue
```bash
# Compilar
npm run build

# Ejecutar con migraciones automáticas
npm run start:prod:migrate
```

## 🛠️ Troubleshooting

### Error de conexión en scripts locales
```bash
# Verificar que PostgreSQL esté corriendo
docker ps

# Si no está corriendo
docker start postgres-businesses
```

### Error "User was denied access"
```bash
# Verificar conexión
npm run db:pull

# Si falla, recrear contenedor PostgreSQL
docker stop postgres-businesses
docker rm postgres-businesses
docker run -d --name postgres-businesses -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=businesses -p 5432:5432 postgres:13
```

### Prisma Studio no abre
```bash
# Generar cliente primero
npm run db:generate

# Luego intentar studio
npm run db:studio
```

## 🔍 Scripts de Debug

### Debug de Base de Datos
```bash
# Ver resumen completo de datos
npm run db:debug

# Ver servicios específicos
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.service.findMany().then(console.log).finally(() => prisma.\$disconnect());
"
```

### Debug de Aplicación
```bash
# Ver logs detallados
DEBUG=prisma:* npm run start:dev

# Debug con inspector de Node.js
npm run start:debug
# Conectar en chrome://inspect
```

## 📝 Notas Importantes

1. **Scripts `db:*`**: Siempre usan `localhost:5432`
2. **Variables .env**: Configuradas para Docker con `host.docker.internal:5432`
3. **Prisma Studio**: Solo funciona con conexión localhost
4. **Migraciones**: Usar en desarrollo y producción
5. **db:push**: Solo para desarrollo rápido, puede perder datos

## 🚀 Scripts de Producción

### Google Cloud Run
```bash
# En cloudbuild.yaml
steps:
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
  
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
  
  - name: 'node:18'
    entrypoint: 'npx'
    args: ['prisma', 'migrate', 'deploy']
    env:
      - 'DATABASE_URL=${_DATABASE_URL}'
```

### Dockerfile
```dockerfile
# Comando de inicio con migraciones automáticas
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node dist/main.js"]
```
