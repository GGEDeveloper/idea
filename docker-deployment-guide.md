# 🥈 **OPÇÃO 2: Docker (MÁXIMA PORTABILIDADE)**

## **Por que Docker é superior:**
- ✅ Ambiente idêntico: dev = produção
- ✅ Escalabilidade horizontal fácil
- ✅ Isolamento completo
- ✅ CI/CD integrado
- ✅ Funciona em qualquer servidor

---

## **1. Dockerfile Otimizado (Multi-stage)**

```dockerfile
# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine AS production

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## **2. docker-compose.yml Completo**

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: idea-app
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - app-network

  # Database (se necessário)
  db:
    image: postgres:15-alpine
    container_name: idea-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: idea
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## **3. Nginx Config para Docker**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name _;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## **4. Scripts de Deploy**

```bash
#!/bin/bash
# deploy-docker.sh

echo "🐳 Deploy com Docker..."

# Build da imagem
docker-compose build --no-cache

# Stop containers antigos
docker-compose down

# Start novos containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

## **5. Docker com CI/CD (GitHub Actions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/your/app
          git pull origin master
          docker-compose down
          docker-compose build --no-cache
          docker-compose up -d
```

---

## **📊 Vantagens Docker:**
- **Portabilidade**: Funciona igual em qualquer lugar
- **Isolamento**: Zero conflitos entre aplicações
- **Escalabilidade**: `docker-compose scale app=5`
- **Rollback**: `docker-compose down && docker-compose up`
- **Consistency**: Mesmo ambiente dev/staging/prod
- **CI/CD**: Integração perfeita com pipelines 