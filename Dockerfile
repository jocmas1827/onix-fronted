# Etapa 1: Construir la aplicación
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# En Vite, las variables deben estar presentes en el build. Easypanel las inyectará automáticamente.
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copiar el archivo de configuración de nginx para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
