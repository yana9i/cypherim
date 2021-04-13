'use strict';

import redis from '../../util/redis.js';
import { ioEvent } from '../../util/dictionary.js';

/** @param {import ('socket.io/dist/socket').Socket} socket  */

export default socket => async (payload) => {
  const to = await redis.get(payload.to);
  socket.to(to).emit(ioEvent.msg, payload)
}