'use strict';

import friendships from '../model/userFriendship.js';

const createFriendshipRequest = async ({ userHostId, userFriendId }) => {
  const isFriendship = await isFriendshipExist({ userHostId, userFriendId });
  if (!isFriendship) {
    const createResult = await friendships.create({
      userHostId,
      userFriendId
    });
    return createResult
  } else {
    throw new Error('Friendship Exist');
  }
};

const rejectFriendshipRequest = async ({ userHostId, userFriendId }) => {
  return await friendships.findOneAndDelete({ userHostId, userFriendId }).exec();
};

const acceptFriendshipRequest = async ({ userHostId, userFriendId }) => {
  const updateResult = await friendships.findOneAndUpdate({ userHostId, userFriendId }, { pending: false }, { useFindAndModify: true }).exec();
  if (updateResult) {
    let revFriendshipResult = await friendships.findOneAndUpdate({
      userHostId: userFriendId,
      userFriendId: userHostId,
    }, { pending: false }, { useFindAndModify: true }).exec();
    if (!revFriendshipResult)
      revFriendshipResult = await friendships.create({
        userHostId: userFriendId,
        userFriendId: userHostId,
        pending: false
      });
    return [updateResult, revFriendshipResult];
  } else {
    return [];
  }
}

const setNickname = async ({ userHostId, userFriendId, nickname }) => {
  return await friendships.findOneAndUpdate({ userHostId, userFriendId }, { nickname }, { new: true, useFindAndModify: true }).exec();
};

const getFriendlist = async ({ userHostId }) => {
  return await friendships.findFriendByHostUserId(userHostId);
};

const isFriendshipExist = async ({ userHostId, userFriendId }) => {
  const findResult = await friendships.find({ userHostId, userFriendId }).exec();
  return findResult.length > 0;
}

const deleteFriendship = async ({ userHostId, userFriendId }) => {
  const delResult = await friendships.findOneAndDelete({ userHostId, userFriendId }).exec();
  const revDelResult = await friendships.findOneAndDelete({
    userHostId: userFriendId,
    userFriendId: userHostId
  }).exec();
  return [delResult, revDelResult]
}

export default {
  createFriendshipRequest,
  rejectFriendshipRequest,
  acceptFriendshipRequest,
  setNickname,
  getFriendlist,
  deleteFriendship
}