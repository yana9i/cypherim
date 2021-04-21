'use strict';


import { ioEvent } from '../../util/dictionary.js';
import redis from '../../util/redis.js';

import { IoArgs } from '../../util/ioEventArgsFormatter.js';

import friendshipService from '../../service/friendship.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */
export default socket => async () => {
  console.log(socket.userInfo.username + " disconnected");

  const friendlist = await friendshipService.getFriendlistById({ userHostId: socket.userInfo._id });
  await Promise.all(friendlist.map(async item => {
    const socketId = await redis.get(item._id);
    const online = socketId !== null
    online && socket.to(socketId).emit(ioEvent.iq, new IoArgs('logoutSuccess', { from: socket.userInfo._id }))
  }));
  await redis.del(socket.userInfo._id);
}