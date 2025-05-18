FROM node:alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set environment variables
ENV frontend_url=http://localhost:5173/
ENV PORT=5000

# Expose the necessary ports
EXPOSE 5000

# Run the application
CMD ["npm", "run", "start:docker"]