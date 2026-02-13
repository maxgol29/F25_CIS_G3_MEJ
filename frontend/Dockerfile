FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN adduser --system --no-create-home appuser \
    && chown -R appuser:nginx /usr/share/nginx/html \
    && chown -R appuser:nginx /var/cache/nginx \
    && chown -R appuser:nginx /var/log/nginx \
    && chown -R appuser:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown appuser:nginx /var/run/nginx.pid

EXPOSE 8080

USER appuser

CMD ["nginx", "-g", "daemon off;"]