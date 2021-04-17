'use strict';

import Koa from 'koa'
import { createServer as createHttpServer } from 'http';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { Server as socketIO } from 'socket.io';

import router from './app/router.js';
import errorHandler from './app/middleware/errorHandle.js';
import initIO from './app/io/init.js';

const port = 3000;

const app = new Koa();

const httpServer = createHttpServer(app.callback());
const io = new socketIO(httpServer, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8
});

app.use(logger())
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Headers", "content-type");
  await next()
})
app.use(errorHandler())
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

initIO(io);

httpServer.listen(port, () => {
  console.log(`Listen on port ${port}`);
});

