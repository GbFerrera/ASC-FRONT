FROM node:18.19-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Set environment variables for Railway
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV RAILWAY_ENVIRONMENT=production

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"]
