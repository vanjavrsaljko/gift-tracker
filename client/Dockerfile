# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use --legacy-peer-deps for React 19 compatibility)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build argument for API URL
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Speed up build for micro VMs
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=512
ENV DISABLE_ESLINT_PLUGIN=true

# Build the app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files (react-scripts builds to /app/build, not /app/dist)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx user already exists in nginx:alpine image, no need to create

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
