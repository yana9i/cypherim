'use strict';



export default () =>
  /**
   * @typedef {import ('koa').Context} ctx
   * @param {ctx} ctx
   * @param {Promise<Any>} next
   */
  async (ctx, next) => {
    try {
      await next();
    }
    catch (err) {
      ctx.response.status = err.statusCode || err.status || 500;
      ctx.response.body = {
        code: ctx.response.status,
        status: 'error',
        message: err.message
      };
      console.error(err)
    };
  };
