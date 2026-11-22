FROM node:22-alpine

# Patch paket OS Alpine untuk menutup CVE bawaan sistem operasi
RUN apk update && apk upgrade --no-cache

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && \
    # Hapus npm, npx, corepack, dan yarn dari image produksi untuk mengecilkan attack surface & CVE bawaan
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn*

COPY src ./src

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/metrics', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]