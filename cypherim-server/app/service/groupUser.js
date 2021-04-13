'use strict';

import groups from '../model/group.js';
import groupUsers from '../model/groupUser.js';

const addGroupUser = async ({ groupId, userId }) => {
  const createResult = await groupUsers.create({ groupId, userId });
  if (createResult)
    await groups.updateOne({ groupId }, { $inc: { "userCount": 1 } }).exec();
  return createResult;
}

const removeGroupUser = async ({ groupId, userId }) => {
  const removeResult = await groupUsers.remove({ groupId, userId }).exec();
  if (createResult)
    await groups.updateOne({ groupId }, { $inc: { "userCount": -1 } }).exec();
  return removeResult
}

const editGroupUserNickname = async ({ groupId, userId, nickname }) => {
  return await groupUsers.findOneAndUpdate({ groupid, userId }, { nickname }, { new: true }).exec();
}

export default {
  addGroupUser,
  removeGroupUser,
  editGroupUserNickname
}