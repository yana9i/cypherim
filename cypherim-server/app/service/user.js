'use strict';

import crypto from 'crypto';

import users from '../model/user.js';
import mongoose from 'mongoose'

const md5 = password => crypto.createHash('md5').update(password).digest('hex');

const login = async ({ username, password }) => {
  if ((!username) || (!password)) {
    const err = new Error('Invalid Username or Password');
    err.statusCode = 403;
    throw err;
  }
  const result = await users.findOne({ username }).exec();
  if (result) {
    const crypthedPass = md5(password);
    if (result['password'] === crypthedPass) {
      const now = Date.now()
      await users.updateOne({ username }, { lastLoginTime: now });
      const resultToReturn = result.toObject();
      delete resultToReturn.__v;
      delete resultToReturn.password;
      return resultToReturn;
    } else {
      const err = new Error('Authorize Failed');
      err.statusCode = 403;
      throw err;
    }
  } else {
    const err = new Error('Authorize Failed');
    err.statusCode = 403;
    throw err;
  }
}

const regist = async ({ username, password }) => {


  const alreadyExistUser = await users.findOne({ username }).exec();
  if (alreadyExistUser) {
    const err = new Error('Username not Unique');
    err.statusCode = 403;
    throw err;
  } else {
    const crypthedPass = md5(password);
    const result = await users.create({ username, password: crypthedPass });
    return {
      username: result['username'],
      _id: result['_id'],
      avatar: result['avatar']
    };
  }
}

const getUserinfo = async ({ username, userId }) => {
  if (username) {
    return await users.findOne({ username }).select('-password').exec();
  }
  if (userId) {
    return await users.findById(userId).exec();
  }
}

const updateUserInfo = async ({ userId, newUserInfo }) => {
  const result = await users.findByIdAndUpdate(userId, newUserInfo, {
    useFindAndModify: true,
    new: true
  }).exec();
  const response = result.toObject();
  delete response.__v;
  delete response.password;
  return response;
}

const huntUserByUsername = async (keyword) => {
  const formatStr = str => {
    if (mongoose.Types.ObjectId.isValid(keyword))
      return str;
    return '0'.repeat(24);
  }
  const regex = new RegExp(keyword, 'i');
  const result = await users.find({
    $or: [
      { username: { $regex: regex } },
      { _id: formatStr(keyword) }
    ]
  }).select(' -__v -signUpTime -lastLoginTime -password').exec();
  return result;
}

export default {
  login,
  regist,
  getUserinfo,
  updateUserInfo,
  huntUserByUsername
}