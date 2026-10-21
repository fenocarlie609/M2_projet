# Image de production du serveur (Node.js / Express / Prisma).
# Étape 1 : installation complète, nécessaire pour générer le client Prisma.
# Étape 2 : dépendances de production seules.
# Étape 3 : image finale, exécutée par un utilisateur non privilégié.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
COPY prisma.config.js ./
# Le code source est necessaire au service d'amorcage, qui reutilise les
# utilitaires de l'application (hachage des mots de passe).
COPY src ./src
# La generation du client ne se connecte pas a la base, mais la
# configuration de Prisma 7 exige la presence de la variable.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npx prisma generate

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

RUN apk add --no-cache wget \
    && addgroup -S nodejs -g 1001 \
    && adduser -S nodejs -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src/generated ./src/generated
COPY --chown=nodejs:nodejs . .

RUN mkdir -p /app/logs /app/public/uploads/avatars \
    && chown -R nodejs:nodejs /app/logs /app/public

USER nodejs
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["node", "server.js"]
