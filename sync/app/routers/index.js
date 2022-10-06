/**
 * Route
 */
const debug = require("debug")("sync:routes:index");
const router = require("koa-router")();
const githubRouter = require("./github.router");

router.use("/api/github",
    githubRouter.routes(),
    githubRouter.allowedMethods());

exports = module.exports = router;