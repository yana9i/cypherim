'use strict';

import db from '../util/database.js';

const userChatlogScheme = new db.Schema({
  from: {
    type: db.Schema.Types.ObjectId,
    ref: 'users'
  },
  to: {
    type: db.Schema.Types.ObjectId,
    ref: 'users'
  },
  message: { type: String },
  createAt: { type: Date }
})

const userChatlogs = db.model('userChatlogs', userChatlogScheme);
const userChatlogStash = db.model('userChatlogStashes', userChatlogScheme);

export { userChatlogs, userChatlogStash }