'use strict';

import { ioEvent } from '../../util/dictionary.js';
import { IoArgs } from '../../util/ioEventArgsFormatter.js';

import friendshipService from '../../service/friendship.js';
import userChatlogStashService from '../../service/userChatlogStash.js';
import userService from '../../service/user.js';
import redis from '../../util/redis.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */
export default socket => (args, callback) => {
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
      const stashedChatlog = await userChatlogStashService.getUserChatlogStash(socket.userInfo._id);
      stashedChatlog.forEach(item => {
        const { from, to, message } = item;
        socket.emit(ioEvent.msg, { from, to, message, type: 'plain' });
        userChatlogStashService.delUserChatlogStash(item._id);
      });
    },
    friendshipRequest: () => {
      console.log(args);
    },
    requestCryptoChat: async () => {
      const to = await redis.get(args.payload.to);
      socket.to(to).emit(ioEvent.iq, args);
    },
    acceptCryptoChat: async () => {
      const to = await redis.get(args.payload.to);
      console.log(to);
      socket.to(to).emit(ioEvent.iq, args);
    },
    userHunt: async () => {
      const userList = await userService.huntUserByUsername(args.keyword);
      callback(userList);
    }
  }
  typeSwitch[args.type] && typeSwitch[args.type]()
}