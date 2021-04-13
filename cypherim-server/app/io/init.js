'use strict';

import logger from './middleware/logger.js';
import auth from './middleware/auth.js';

import onMessage from './listener/message.js';
import onDisconnect from './listener/disconnect.js'
import onInfoQuery from './listener/infoquery.js';

import { ioEvent } from '../util/dictionary.js';
import { MessageIoArgs, IqIoArgs, PresenceIoArgs, IoArgs } from '../util/ioEventArgsFormatter.js';

/** @param {import ('socket.io/dist/index').Server} io */
// const getConnectingConnections = io => {
//   const users = [];
//   for (let socket of io.of("/").sockets) {
//     users.push({
//       userID: socket.userId,
//       username: socket.username,
//     });
//   }
//   return users;
// }

/** @param {import ('socket.io/dist/index').Server}  io */
export default io => {

  io.use(logger);

  io.use(auth(io));

  io.on(ioEvent.conn, socket => {

    console.log(`User ${socket.userInfo.username} on ${socket.id} connected`);

    socket.on(ioEvent.iq, onInfoQuery(socket))

    socket.on(ioEvent.msg, onMessage(socket));

    socket.on(ioEvent.dcon, onDisconnect(socket));

  });
}