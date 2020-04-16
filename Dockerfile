FROM node
WORKDIR /app
CMD node .
COPY package.json .
RUN npm i
COPY . .