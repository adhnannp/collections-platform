# Use Node.js 22 image
FROM node:22.17.1

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --only=production

# Copy the source code
COPY server ./server
COPY tsconfig.json ./

# Build TypeScript to JavaScript
RUN npm run build

# Expose app port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
