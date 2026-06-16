FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js index.html ./
COPY src ./src
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
