FROM node:22.17.1

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install all dependencies for build
RUN npm install

# Copy source code
COPY server ./

# Build TypeScript
RUN npm run build

# Remove dev dependencies to shrink image
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "start"]