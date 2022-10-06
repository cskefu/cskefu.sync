/**
 * Connect with GitHub
 */

const debug = require("debug")("sync:routes:github");
const _ = require("lodash");
const axios = require("axios");
const Router = require("koa-router");
const router = new Router();

router.get('/foo', async (ctx, next) => {
    ctx.body = {
        data: "bar"
    };

    await next();
})


exports = module.exports = router;