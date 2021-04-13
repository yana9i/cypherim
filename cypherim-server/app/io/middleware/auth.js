'use strict';


import userService from '../../service/user.js';
import redis from '../../util/redis.js';

/** @param {import ('socket.io/dist/index').Server}  io */
export default io =>

  /**
   * @typedef {import('socket.io/dist/namespace').ExtendedError} ExtendedError
   * @param {import ('socket.io/dist/socket').Socket} socket
   * @param {(err?: ExtendedError) => void} next
   */
  async (socket, next) => {

    const sessionID = socket.handshake.auth.sessionID;
    const { username, password } = socket.handshake.auth;

    try {
      const userInfo = await userService.login({ username, password });
      socket.userInfo = userInfo;
      const lastSocketId = await redis.get(userInfo._id);
      if (lastSocketId) {
        const lastSocket = io.of('/').sockets.get(lastSocketId);
        if (lastSocket) {
          throw new Error("User Has Login");
        }
      }
      await redis.set(userInfo._id, socket.id);
      await next();
    } catch (err) {
      return await next(err);
    }
  }