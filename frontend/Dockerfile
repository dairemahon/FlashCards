# start from an official node 20 image. Alpine is a an even more minimal Linux variant
From node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
# more relaibele and faster than npm install
RUN npm ci

# Copies rest of the React code and runs it
# Runs vite and outputs compiled, minified HTML, CSS and JS into the /app/dist directory
COPY . .
RUN npm run build

# Starts brand new, completely separate imgae - just Nginx on Alpine Linux
# Everything from teh Node stage above is discarded
#Final image contains zero Node.js, node_module and build tools.
#"THIS IS CALLED MULTI-STAGE BUILD. IT'S WHY THE FINAL IMAGE IS TINY AND SECURE. LEARN MORE ABOUT THIS"
FROM nginx:alpine

# Copy only the built files from the first stage (/app/dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copies the Nginx configuration file into the image, replacing the default one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80
EXPOSE 80
# daemon off; tells Nginx to run in the foreground, otherwise\
# Docker thinks the container has finished and stops it.
CMD ["nginx", "-g", "daemon off;"]

