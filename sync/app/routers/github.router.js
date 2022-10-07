/**
 * Connect with GitHub
 */

const debug = require("debug")("sync:routes:github");
const _ = require("lodash");
const axios = require("axios");
const Router = require("koa-router");
const router = new Router();
const githubCtrl = require("../controllers/github.ctrl");

/**
 * Receive GitHub Webhook Events
 */
router.post('/webhooks', async (ctx, next) => {
    let body = ctx.request.body;
    debug("/webhooks headers", JSON.stringify(ctx.request.headers, null, 2))
    debug("/webhooks", "ctx.params", JSON.stringify(ctx.params), ", body\n", JSON.stringify(body, null, 2));

    ctx.body = await githubCtrl.handleGitHubWebhooks(ctx.request.headers, ctx.params, body);

    await next();
})


exports = module.exports = router;