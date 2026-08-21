FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4001
ENV DATA_DIRECTORY=/app/data
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/seed ./seed
RUN mkdir -p /app/data
VOLUME ["/app/data"]
EXPOSE 4001
CMD ["npm", "start"]
