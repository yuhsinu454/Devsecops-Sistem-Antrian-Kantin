# Gunakan base image minimalis (mengurangi area serangan/SCA)
FROM node:20-alpine

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
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/metrics', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
CMD ["node", "src/server.js"]