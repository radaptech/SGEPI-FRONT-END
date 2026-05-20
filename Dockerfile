# =================================================================
# ETAPA 1: BUILD (Compilando o React)
# =================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e instala
COPY SGEEPI-FRONT-END/package*.json ./
RUN npm install

# Copia o restante do código do front
COPY SGEEPI-FRONT-END/ .

# Roda o comando que gera os arquivos estáticos na pasta /build
RUN npm run build

# =================================================================
# ETAPA 2: NGINX (Servindo o React e roteando a API)
# =================================================================
FROM nginx:alpine

# Copia o arquivo de configuração do Nginx que está lá no backend!
COPY gestao-de-epi--backEnd/nginx.prod.conf /etc/nginx/nginx.conf

# Pega os arquivos estáticos gerados na ETAPA 1 e joga na pasta padrão do Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# A porta 80 do container já fica exposta automaticamente pela imagem do Nginx
CMD ["nginx", "-g", "daemon off;"]