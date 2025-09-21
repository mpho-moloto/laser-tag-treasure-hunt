# Use Node.js 18 Alpine for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Check what was built and adjust path accordingly
RUN if [ -f "dist/index.js" ]; then \
      echo "Found dist/index.js"; \
    elif [ -f "dist/server/index.js" ]; then \
      echo "Found dist/server/index.js, moving to dist/"; \
      mv dist/server/* dist/ 2>/dev/null || true; \
    fi

# Remove dev dependencies after build to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose the port
EXPOSE 5001

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]