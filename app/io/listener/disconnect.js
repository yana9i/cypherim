'use strict';

import InMemorySessionStore from '../sessionStore.js';

import { ioEvent } from '../../util/dictionary.js';


/** @param {import ('socket.io/dist/socket').Socket} socket  */
export default socket => () => {
  console.log(socket.userInfo.username + " disconnected");
  socket.broadcast.emit(ioEvent.iq, { userID: socket.id, username: socket.username });
  // InMemorySessionStore().saveSession(socket.sessionID, {
  //   userID: socket.userID,
  //   username: socket.username,
  //   connected: false,
  // });
}