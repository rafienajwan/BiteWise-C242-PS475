# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Reinstall production dependencies
RUN npm install --only=production

# Expose the port the application runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]