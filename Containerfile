FROM node:18-alpine AS build
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/package.json /app/dist ./
RUN npm ci --production

ENV MCP_SERVER_PORT=5005
ENV ACTUAL_API_URL=
ENV ACTUAL_API_KEY=

EXPOSE 5005
CMD ["node", "dist/index.js"]
