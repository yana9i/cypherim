'use strict';

import userService from '../service/user.js';

/**
 * @typedef {import ('koa').Context} ctx
 * @param {ctx} ctx
 * @param {Promise<Any>} next
 */

const register = async (ctx, next) => {
  const response = await userService.regist(ctx.request.body);
  ctx.response.body = response;
  await next();
}

export default {
  register,
}