# ==========================================
# STAGE 1: Build React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
# Build the React app with a relative API base URL
RUN VITE_API_BASE_URL="" npm run build

# ==========================================
# STAGE 2: Build Python Backend & Assemble App
# ==========================================
FROM python:3.10-slim

# Install system dependencies, including Nginx
RUN apt-get update && apt-get install -y \
    nginx \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Setup non-root user for Hugging Face compatibility (UID 1000)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Ensure Nginx directories have correct permissions for the non-root user
RUN mkdir -p /var/lib/nginx /var/log/nginx /etc/nginx/conf.d && \
    chown -R user:user /var/lib/nginx /var/log/nginx /etc/nginx

# Copy Python requirements first to leverage caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY manage.py ./
COPY backend/ ./backend/
COPY analyzer/ ./analyzer/

# Copy built frontend assets from STAGE 1
COPY --from=frontend-builder /build/dist/ ./frontend/dist/

# Copy configurations and script
COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh ./

# Adjust permissions for directories that require runtime writing
RUN mkdir -p /app/staticfiles /app/media /app/chroma_db && \
    chown -R user:user /app && \
    chmod +x start.sh

# Switch to the non-root user
USER user

# Expose Hugging Face default port
EXPOSE 7860

# Define start command
CMD ["./start.sh"]
