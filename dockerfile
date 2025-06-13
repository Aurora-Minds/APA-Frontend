FROM node:20-alpine

ARG REACT_APP_API_BASE_URL

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Expose the port React runs on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
