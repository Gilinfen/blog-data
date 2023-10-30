FROM node:18.16.0-alpine AS builder

# 设置淘宝镜像
RUN npm config set registry https://registry.npm.taobao.org

WORKDIR /app
COPY ./web .
COPY ./nginx.conf .

RUN rm -rf node_modules pnpm-lock.yaml

RUN npm install && npm run build

FROM alpine:latest

RUN apk update && apk add nginx && rm -rf /var/cache/apk/*

WORKDIR /app

EXPOSE 80

COPY --from=builder /app/dist /usr/share/nginx/dist

COPY --from=builder /app/nginx.conf /etc/nginx/http.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
