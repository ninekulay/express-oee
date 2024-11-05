# Use an official Node.js runtime as a base image
FROM node:14

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# # Install Curl
# RUN apt-get update && apt-get install -y curl

# Install app dependencies
RUN npm install

# Copy the application files to the working directory
COPY . .

# Install PM2 globally
RUN npm install pm2 -g

# Expose the port your app will run on
EXPOSE 3001

# Start the application using PM2
CMD ["pm2-runtime", "src/server-settings.js"]