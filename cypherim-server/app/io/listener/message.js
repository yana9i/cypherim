'use strict';

import redis from '../../util/redis.js';
import { ioEvent } from '../../util/dictionary.js';
import userChatlogStash from '../../service/userChatlogStash.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */

export default socket => async (payload) => {
  const to = await redis.get(payload.to);
  if (to)
    socket.to(to).emit(ioEvent.msg, payload);
  else
    if (payload.type === 'plain') {
      await userChatlogStash.addUserChatlogStash({ ...payload, createAt: Date.now() });
    }
}