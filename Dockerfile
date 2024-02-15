# FROM node:20-alpine as builder
# ENV NODE_ENV production
# USER node

# WORKDIR /home/node

# COPY . .
# COPY ./.env.production ./.env

# RUN npm install --quiet --no-optional --no-found --loglovel=error
# RUN npx prisma generate
# RUN npm run build 

# EXPOSE 3000

# CMD ["npm", "run", "start:prod"]

FROM node:20-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

# COPY package*.json ./
# COPY ./.env.production ./.env
COPY . .
COPY ./.env.production ./.env
RUN npm ci

COPY --chown=node:node . .
RUN npx prisma generate \
    && npm run build \
    && npm prune 

# ---

FROM node:20-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma/
COPY --from=builder --chown=node:node /home/node/.env ./.env

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

CMD ["npm", "run", "start:prod"]