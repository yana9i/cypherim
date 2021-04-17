'use strict';

import { userChatlogStash } from '../model/userChatlog.js';

export default {
  addUserChatlogStash: async ({ from, to, message, createAt }) => {
    const result = await userChatlogStash.create({ from, to, message, createAt })
    return result;
  },

  getUserChatlogStash: async userId => {
    const result = await userChatlogStash.find({ to: userId }).exec();
    return result.map(item => {
      return {
        _id: item._id,
        from: item.from,
        to: item.to,
        message: item.message
      }
    })
  },

  delUserChatlogStash: async _id => {
    const result = await userChatlogStash.findOneAndRemove({ _id }).exec();
    return result;
  }
}