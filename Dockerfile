# Use a imagem oficial do Node.js 18 LTS
FROM node:18-alpine

# Definir diretório de trabalho (evita conflito com /app do Nixpacks)
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Instalar dependências de desenvolvimento para build
RUN npm ci

# Compilar TypeScript
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]

