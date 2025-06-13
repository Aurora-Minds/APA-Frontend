FROM node:20-alpine

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_PORT=3000
ARG REACT_APP_PRIMARY_COLOR=#1976d2
ARG REACT_APP_SECONDARY_COLOR=#dc004e

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_PORT=$REACT_APP_PORT
ENV REACT_APP_PRIMARY_COLOR=$REACT_APP_PRIMARY_COLOR
ENV REACT_APP_SECONDARY_COLOR=$REACT_APP_SECONDARY_COLOR

# Expose the port React runs on
EXPOSE $REACT_APP_PORT

# Start the React app
CMD ["npm", "start"]
