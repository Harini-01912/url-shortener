# Base image
FROM node:22-alpine

# Create working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project
COPY . .

# Expose application port
EXPOSE 3000

# Start server
CMD ["npm", "start"]