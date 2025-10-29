# Use a imagem oficial do Node.js 18 LTS
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (dev + prod) para build
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Remover dependências de desenvolvimento e node_modules
RUN npm prune --production

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]

