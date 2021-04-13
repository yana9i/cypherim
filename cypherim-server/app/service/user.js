'use strict';

import crypto from 'crypto';

import users from '../model/user.js';

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
      return {
        username: result['username'],
        _id: result['_id'],
        avatar: result['avatar'],
        lastLoginTime: now,
      }
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



export default {
  login,
  regist,
  getUserinfo,
}