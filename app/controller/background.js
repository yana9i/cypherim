'use strict';

import axios from 'axios';

/**
 * @typedef {import ('koa').Context} ctx
 * @param {ctx} ctx
 * @param {Promise<Any>} next
 */

const get = async (ctx, next) => {
  const response = await axios(`https://cn.bing.com/HPImageArchive.aspx?${ctx.request.querystring}`);
  ctx.response.body = response.data;
  await next();
}

export default {
  get
}