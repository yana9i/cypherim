'use strict';


import userService from '../../service/user.js';

// import crypto from 'crypto';
// import InMemorySessionStore from '../sessionStore.js';
// const randomId = () => crypto.randomBytes(8).toString("hex");
// const sessionStore = InMemorySessionStore();

/**
 * @typedef {import('socket.io/dist/namespace').ExtendedError} ExtendedError
 * @param {import ('socket.io/dist/socket').Socket} socket
 * @param {(err?: ExtendedError) => void} next
 */

export default async (socket, next) => {

  const sessionID = socket.handshake.auth.sessionID;
  const { username, password } = socket.handshake.auth;

  try {
    const userInfo = await userService.login({ username, password });
    socket.userInfo = userInfo;
    await next();
  } catch (err) {
    return await next(err);
  }
}