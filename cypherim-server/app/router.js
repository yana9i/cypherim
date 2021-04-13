'use strict';

import Router from 'koa-router';

import user from './controller/user.js';
import session from './controller/session.js';
import background from './controller/background.js';

const router = new Router();

router.get('/hello', async (ctx, next) => {
  ctx.body = "Hello wordl from router router"
  await next();
})

router.post('/api/session', session.login) //创建新的会话（登录）
router.delete('/api/session') //销毁当前会话（登出）

router.post('/api/user', user.register); //创建新的用户（注册）
router.delete('/api/user/:id') //删除 id 用户（注销）

router.get('/api/img/background', background.get)

export default router;