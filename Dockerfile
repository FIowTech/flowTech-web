# Dockerfile Site - Version 1.0

# ==========================================
# ESTÁGIO 1 - BUILD DO FRONTEND
# ==========================================
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install

COPY ./app ./

RUN npm run build


# ==========================================
# ESTÁGIO 2 - DEPENDÊNCIAS DO BACKEND
# ==========================================
FROM node:22-alpine AS backend-build

WORKDIR /server

COPY ./server/package*.json ./

RUN npm install

COPY ./server ./


# ==========================================
# ESTÁGIO 3 - PRODUÇÃO
# ==========================================
FROM node:22-alpine AS production

# Copia frontend
WORKDIR /app

COPY --from=frontend-build /app ./

# Copia backend
WORKDIR /server

COPY --from=backend-build /server ./

EXPOSE 5173 3333

CMD ["sh", "-c", "cd /server && npm start & cd ../app && npm run dev -- --host 0.0.0.0"]