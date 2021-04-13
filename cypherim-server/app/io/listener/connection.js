'use strict';

/**
* @param {import ('socket.io/dist/socket').Socket} socket 
* @param {import ('socket.io/dist/index').Server} io 
*/

export default (io, socket) => {
  console.log('a user connected');
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("userlist", users);
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username
  });

  // forward the private message to the right recipient
  socket.on("message", ({ message, to }) => {
    socket.to(to).emit("message", {
      message,
      from: socket.id,
    });
  });

  // notify users upon disconnection
  socket.on("disconnect", () => {
    console.log(socket.username + " disconnected");
    socket.broadcast.emit("user disconnected", { userID: socket.id, username: socket.username });
  });
}