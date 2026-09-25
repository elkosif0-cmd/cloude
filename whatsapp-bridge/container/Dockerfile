FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.mjs ./
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.mjs"]
