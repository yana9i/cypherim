'use strict';

import { ioEvent } from '../../util/dictionary.js';
import { IoArgs } from '../../util/ioEventArgsFormatter.js';

import friendshipService from '../../service/friendship.js';
import redis from '../../util/redis.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */
export default socket => args => {
  const typeSwitch = {
    loginSuccess: async () => {
      socket.emit(ioEvent.iq, new IoArgs('selfLoginSuccess', socket.userInfo));
      const friendlist = await friendshipService.getFriendlist({ userHostId: socket.userInfo._id });
      const friendlistOnlineSocketIds = [];
      const friendlistWithOnline = await Promise.all(friendlist.map(async item => {
        const socketId = await redis.get(item._id);
        const online = socketId !== null
        online && friendlistOnlineSocketIds.push(socketId);
        return {
          ...item,
          online
        }
      }));
      socket.emit(ioEvent.iq, new IoArgs('friendlist', friendlistWithOnline));
      friendlistOnlineSocketIds.forEach(item => socket.to(item).emit(ioEvent.iq, new IoArgs('loginSuccess', { from: socket.userInfo._id })));
    },
    friendshipRequest: () => {
      console.log(args);
    },
    requestCryptoChat: async () => {
      const to = await redis.get(args.payload.to);
      console.log(to);
      socket.to(to).emit(ioEvent.iq, args);
    },
    acceptCryptoChat: async () => {
      const to = await redis.get(args.payload.to);
      console.log(to);
      socket.to(to).emit(ioEvent.iq, args);
    },
  }
  typeSwitch[args.type] && typeSwitch[args.type]()
}