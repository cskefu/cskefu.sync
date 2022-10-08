/**
 * Connect with W3
 */

 const debug = require("debug")("sync:routes:w3");
 const _ = require("lodash");
 const axios = require("axios");
 const Router = require("koa-router");
 const router = new Router();
 const w3Ctrl = require("../controllers/w3.ctrl");
 
 /**
  * Receive GitHub Webhook Events
  */
 router.post('/broadcast', async (ctx, next) => {
     let body = ctx.request.body;
     debug("/broadcast headers", JSON.stringify(ctx.request.headers, null, 2))
     debug("/broadcast", "ctx.params", JSON.stringify(ctx.params), ", body\n", JSON.stringify(body, null, 2));

     ctx.body = await w3Ctrl.handleW3broadcast(ctx.request.headers, ctx.params, body);
 
     await next();
 })
 
 
 exports = module.exports = router;