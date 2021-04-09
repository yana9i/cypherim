'use strict';

import groups from '../model/group.js';
import groupUsers from '../model/groupUser.js';

const createGroup = async ({ createrId, groupName }) => {
  const newGroup = await groups.create({ title: groupName, administratorUser: createrId, userCount: 1 });
  if (newGroup['_id']) {
    const newGroupUser = await groupUsers.create({ groupId: newGroup.id, userId: createrId, administrator: true });
    if (newGroupUser['_id']) {
      return newGroup;
    } else {
      await groups.remove({ _id: newGroup.id }).exec();
      return {};
    }
  }
}

const removeGroup = async ({ groupId }) => {
  const removeGroupUserResult = await groupUsers.remove({ _id: groupId }).exec();
  const removeGroupResult = await groups.remove({ _id: groupId });
  return {
    removeGroupResult,
    removeGroupUserResult
  }
}

const getUserJoinedGroup = async ({ userId }) => {
  return await groupUsers.findGroupByUserId(userId);
}


const getGroupUsers = async ({ groupId }) => {
  return await groupUsers.findUserByGroupId(groupId);
}

const getGroupInfo = async ({ groupId }) => {
  const groupInfo = await groups.find({ _id: groupId }).exec();
  const userlist = await groupUsers.findUserByGroupId(groupId);
  return {
    ...groupInfo,
    users: userlist
  }
}

export default {
  createGroup,
  removeGroup,
  getUserJoinedGroup,
  getGroupUsers,
  getGroupInfo
}