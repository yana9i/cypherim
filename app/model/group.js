'use strict';

import db from '../util/database.js';

let groups = db.model('groups', {
  title: String,
  desc: String,
  avatar: String,
  userCount: Number,
  createDate: { type: Date, default: Date.now() },
  administratorUser: { type: db.Schema.Types.ObjectId, refs: 'users' }
})

export default groups;