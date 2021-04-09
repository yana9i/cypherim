'use strict';

/** @param {import ('socket.io/dist/socket').Socket} socket  */

export default socket => ({ message, to }) => {
  socket.to(to).emit("message", {
    message,
    from: socket.id,
  });
}