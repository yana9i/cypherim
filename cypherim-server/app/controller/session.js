'use strict';

import userService from '../service/user.js';

/**
 * @typedef {import ('koa').Context} ctx
 * @param {ctx} ctx
 * @param {Promise<Any>} next
 */

const login = async (ctx, next) => {
  const result = await userService.login(ctx.request.body);
  ctx.response.body = result;
  await next();
}

export default {
  login,
}