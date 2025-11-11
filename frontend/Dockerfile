FROM node:20

WORKDIR /app

# Copy package manifests first (better layer cache)
COPY package*.json ./

# Harden installs against slow registries / firewalls
RUN npm set fund false \
 && npm set audit false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 120000

# Install deps (use lockfile if present)
RUN if [ -f package-lock.json ]; then npm ci --no-audit --progress=false; \
    else npm install --no-audit --progress=false; fi

# Copy the rest of the app
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
