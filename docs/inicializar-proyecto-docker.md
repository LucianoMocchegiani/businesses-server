# Inicializar Proyecto con Docker

## Prerrequisitos

- Tener [Docker](https://www.docker.com/products/docker-desktop/) instalado y funcionando en tu máquina.
- Archivo `.env` configurado en la raíz del proyecto con las variables necesarias.

---

## Comandos útiles

### 1. Construir la imagen de la aplicación

```powershell
docker build -t businesses-server .
```

### 2. Levantar la base de datos PostgreSQL

```powershell
docker run --name postgres-db `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=businesses `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  -d postgres:15
```

### 3. Iniciar la aplicación con variables de entorno
```powershell
docker run -p 3000:3000 --env-file .env businesses-server
```

### Otros comandos útiles
- Ver contenedores activos:
```powershell
docker ps
```
- Detener un contenedor:
```powershell
docker stop <CONTAINER_ID>
```
- Iniciar un contenedor detenido:
```powershell
docker start postgres-db
```