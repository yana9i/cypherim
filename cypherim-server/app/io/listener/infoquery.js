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
      const friendlist = await friendshipService.getFriendlistById({ userHostId: socket.userInfo._id });
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
      const friendshipRequestList = await friendshipService.getPendingRequestsById({ userFriendId: socket.userInfo._id });
      socket.emit(ioEvent.iq, new IoArgs('friendshipRequestList', friendshipRequestList));
      friendlistOnlineSocketIds.forEach(item => socket.to(item).emit(ioEvent.iq, new IoArgs('loginSuccess', { from: socket.userInfo._id })));
      const stashedChatlog = await userChatlogStashService.getUserChatlogStash(socket.userInfo._id);
      stashedChatlog.forEach(item => {
        const { from, to, message } = item;
        socket.emit(ioEvent.msg, { from, to, message, type: 'plain' });
        userChatlogStashService.delUserChatlogStash(item._id);
      });
    },
    friendshipRequest: async () => {
      await friendshipService.createFriendshipRequest(args.payload);
      const socketId = await redis.get(args.payload.userFriendId);
      const online = socketId !== null
      if (online) {
        const friendshipRequestList = await friendshipService.getPendingRequestsById({ userFriendId: args.payload.userFriendId });
        socket.to(socketId).emit(ioEvent.iq, new IoArgs('friendshipRequestList', friendshipRequestList));
      }
    },
    answerFriendshipRequest: async () => {
      const { userHostId, userFriendId, option } = args.payload;
      if (option === 'accept') {
        await friendshipService.acceptFriendshipRequest({ userHostId, userFriendId });
        const getFriendlistWithOnlineById = async userId => {
          const friendlist = await friendshipService.getFriendlistById({ userHostId: userId });
          const friendlistWithOnline = await Promise.all(friendlist.map(async item => {
            const socketId = await redis.get(item._id);
            const online = socketId !== null
            return {
              ...item,
              online
            }
          }));
          return friendlistWithOnline;
        }
        const friendlistWithOnline = await getFriendlistWithOnlineById(userFriendId);
        socket.emit(ioEvent.iq, new IoArgs('friendlist', friendlistWithOnline));
        const socketId = await redis.get(userHostId);
        if (socketId !== null) {
          const friendsFriendshipList = await getFriendlistWithOnlineById(userHostId);
          console.log(friendsFriendshipList);
          socket.to(socketId).emit(ioEvent.iq, new IoArgs('friendlist', friendsFriendshipList));
        }
      }
      if (option === 'reject') {
        await friendshipService.rejectFriendshipRequest({ userHostId, userFriendId });
      }
      const friendshipRequestList = await friendshipService.getPendingRequestsById({ userFriendId: socket.userInfo._id });
      socket.emit(ioEvent.iq, new IoArgs('friendshipRequestList', friendshipRequestList));
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