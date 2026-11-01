# Gunakan base image minimalis (mengurangi area serangan/SCA)
FROM node:18-alpine

# Jalankan dalam mode production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Instal dependensi (tanpa library dev)
COPY package*.json ./
RUN npm install --omit=dev

# Salin source code
COPY src ./src

# DEVSECOPS: Gunakan non-root user bawaan image
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]