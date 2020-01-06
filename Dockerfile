FROM node AS build
WORKDIR /usr/build
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node
ENV NODE_ENV="production"
WORKDIR /usr/src/app
COPY --from=build /usr/build/node_modules/ ./node_modules
COPY --from=build /usr/build/dist/ ./dist/
RUN ls
CMD ["node", "./dist/index.js"]
