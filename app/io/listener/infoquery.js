'use strict';

import { ioEvent } from '../../util/dictionary.js';
import { IoArgs } from '../../util/ioEventArgsFormatter.js';

import friendshipService from '../../service/friendship.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */
export default socket => args => {
  const typeSwitch = {
    loginSuccess: async () => {
      socket.emit(ioEvent.iq, new IoArgs('selfLoginSuccess', socket.userInfo));
      socket.broadcast.emit(ioEvent.iq, new IoArgs('loginSuccess', socket.userInfo));
      const friendlist = await friendshipService.getFriendlist({ userHostId: socket.userInfo._id });
      socket.emit(ioEvent.iq, new IoArgs('friendlist', friendlist))
    },
    friendshipRequest: () => {
      console.log(args);
    }
  }
  typeSwitch[args.type] && typeSwitch[args.type]()
}