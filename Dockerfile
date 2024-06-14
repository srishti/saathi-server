# Use the official Node.js image with the specified version.
# https://hub.docker.com/_/node
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code and the .env file to the container image.
COPY . .

# Copy the entrypoint script into the container.
COPY entrypoint.sh .

# Make the entrypoint script executable.
RUN chmod +x entrypoint.sh

# Set the entrypoint script as the entry point for the container.
ENTRYPOINT ["./entrypoint.sh"]
