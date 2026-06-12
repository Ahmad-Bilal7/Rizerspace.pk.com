FROM node:18-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy backend source files
COPY src ./src

# Cloud Run injects the PORT environment variable dynamically (defaults to 8080)
EXPOSE 8080

# Run the backend server
CMD ["node", "src/index.js"]
