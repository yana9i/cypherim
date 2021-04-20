'use strict';

/**
 * @typedef {import('socket.io/dist/namespace').ExtendedError} ExtendedError
 * @param {import ('socket.io/dist/socket').Socket} socket
 * @param {(err?: ExtendedError) => void} next
 */

export default async (socket, next) => {
  socket.onAny((event, args) => {
    console.log(`--> ${event}`, args, (new Date()));
  });
  await next();
}