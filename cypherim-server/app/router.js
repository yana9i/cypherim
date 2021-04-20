'use strict';

import Router from 'koa-router';

import user from './controller/user.js';
import session from './controller/session.js';
import background from './controller/background.js';
import send from 'koa-send';


const router = new Router();

router.post('/api/session', session.login) //创建新的会话（登录）
router.delete('/api/session') //销毁当前会话（登出）

router.post('/api/user', user.register); //创建新的用户（注册）
router.delete('/api/user/:id') //删除 id 用户（注销）

router.get('/api/img/background', background.get)

router.get('/api/img/avatar/:filename', async (ctx, next) => {
  await send(ctx, ctx.params.filename, { root: './static/avatar' });
  await next();
});

export default router;