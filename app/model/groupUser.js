'use strict';

import db from '../util/database.js';

const groupUsersScheme = new db.Schema({
  groupId: {
    type: db.Schema.Types.ObjectId,
    ref: 'groups'
  },
  userId: {
    type: db.Schema.Types.ObjectId,
    ref: 'users'
  },
  manager: { type: Boolean, default: false },
  administrator: { type: Boolean, default: false },
  nickname: String,
  statics: {
    findGroupByUserId: function (userId, cb) {
      return this
        .find({ userId: userId })
        .populate('groupId')
        .exec(cb);
    },
    findUserByGroupId: function (groupId, cb) {
      return this
        .find({ groupId: groupId })
        .populate({ path: 'userId', select: 'username avatar' })
        .exec(cb);
    }
  }
})

const groupUsers = db.model('groupUsers', groupUsersScheme)

export default groupUsers;
