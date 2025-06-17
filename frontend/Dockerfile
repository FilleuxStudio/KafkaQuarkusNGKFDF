# Stage 1: Build the Vite app using a Debian-based Node image
FROM node:18-buster AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Ensure we build with production mode so that .env.production is loaded
ENV NODE_ENV=development
RUN npm run build -- --mode development

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Remove the default Nginx website files
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output (Vite outputs to the "dist" folder)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
