FROM node:20

WORKDIR /app

# Copy only manifests first (cache-friendly)
COPY package*.json ./

# Harden installs (less flake on Docker networks)
RUN npm set fund false \
 && npm set audit false \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 120000

# Install deps. If you have a lockfile, this will ensure it is respected in future,
# but we use npm install here to be tolerant while you’re iterating.
RUN npm install --no-audit --progress=false

# Now copy the rest of the app
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
