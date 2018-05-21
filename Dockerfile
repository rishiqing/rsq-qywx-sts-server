FROM registry-internal.cn-beijing.aliyuncs.com/rsq-public/node:10

WORKDIR /usr/src/sts-server

COPY . .
RUN npm install

CMD [ "npm", "start" ]
EXPOSE 8300