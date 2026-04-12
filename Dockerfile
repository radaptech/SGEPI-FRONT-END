# 1. Usa uma imagem leve do Node (como se fosse o "Windows" do container)
FROM node:20-alpine

# 2. Cria uma pasta dentro do container para colocar seu app
WORKDIR /app

# 3. Copia os arquivos de dependência primeiro (para aproveitar o cache)
COPY package.json package-lock.json ./

# 4. Instala as dependências DENTRO do container
RUN npm install

# 5. Copia todo o resto do seu código para dentro do container
COPY . .

# 6. Expõe a porta 3000 (onde o React roda)
EXPOSE 3000

# 7. O comando para iniciar o projeto 
CMD ["npm", "start"]