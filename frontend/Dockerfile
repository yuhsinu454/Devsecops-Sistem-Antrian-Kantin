# Base image minimalis
FROM nginxinc/nginx-unprivileged:alpine

# Salin file HTML teman Anda ke direktori default Nginx
COPY index.html /usr/share/nginx/html/
USER nginx
# Port internal untuk container frontend
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1