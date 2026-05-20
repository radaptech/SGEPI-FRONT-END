# 1. Usa a mesma imagem leve do Node
FROM node:20-alpine

# 2. Cria a pasta do app
WORKDIR /app

# 3. Copia os arquivos e instala as dependências
COPY package.json package-lock.json ./
RUN npm install

# 4. Copia o resto do código
COPY . .

# 5. GERA A VERSÃO DE PRODUÇÃO (O segredo está aqui!)
# Isso cria uma pasta chamada "build" com o código otimizado e sem WebSockets
RUN npm run build

# 6. Instala um servidor estático super leve globalmente
RUN npm install -g serve

# 7. Expõe a mesma porta 3000
EXPOSE 3000

# 8. Inicia o servidor estático rodando APENAS a pasta "build" otimizada
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:3000"]