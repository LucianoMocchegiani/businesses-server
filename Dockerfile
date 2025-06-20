FROM node:20

WORKDIR /app

# Copia solo los archivos de dependencias primero (mejor caché)
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependencias y prisma
RUN npm install
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Construye la app
RUN npm run build

# Expone el puerto (opcional, pero recomendado)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]