'use strict';

import userService from '../../service/user.js';
import friendshipService from '../../service/friendship.js';

import redis from '../../util/redis.js';
import saveImage from '../../util/saveImage.js';
import { ioEvent } from '../../util/dictionary.js';


import fs from 'fs/promises';

/** @param {import ('socket.io/dist/socket').Socket} socket  */

export default socket => async args => {
  const typeSwitch = {
    profile: async () => {
      const payload = args.payload;
      const modifyObj = {};
      if (payload.avatar)
        modifyObj.avatar = await saveImage(payload.avatar);
      [modifyObj.nickname, modifyObj.signature] = [payload.nickname, payload.signature];
      const result = await userService.updateUserInfo({
        userId: socket.userInfo._id,
        newUserInfo: modifyObj
      });
      socket.emit(ioEvent.prs, { type: 'selfProfileUpdate', payload: result });

      delete result.lastLoginTime;
      delete result.signUpTime;
      const friendlist = await friendshipService.getFriendlistById({ userHostId: socket.userInfo._id });
      friendlist.map(async item => {
        const socketId = await redis.get(item._id);
        const online = socketId !== null
        online && socket.to(socketId).emit(ioEvent.prs, { type: 'profileUpdate', payload: result });
      });

    }
  }
  typeSwitch[args.type] && typeSwitch[args.type]();
}