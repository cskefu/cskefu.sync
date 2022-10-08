/**
 * Route
 */
const debug = require("debug")("sync:routes:index");
const router = require("koa-router")();
const githubRouter = require("./github.router");
const w3Router = require("./w3.router");

router.use("/api/github",
    githubRouter.routes(),
    githubRouter.allowedMethods());

router.use("/api/w3",
    w3Router.routes(),
    w3Router.allowedMethods());

exports = module.exports = router;