FROM node:20-bookworm-slim

# Install system dependencies if required for native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including nodemon)
RUN npm install

# Copy source code
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose backend port
EXPOSE 8008

# Start backend using nodemon for hot reload
CMD ["npm", "start"]
