/**
 * GitHub Ctrl
 */

const debug = require("debug")("sync:ctrl:github");
const utils = require("../utils/index");
const feishuService = require("../services/feishu.service");



function Controller() {

}

/**
 * Handle Github Webhooks
 * @param {*} headers
 * @param {*} params
 * @param {*} body
 */
Controller.prototype.handleGitHubWebhooks = async function (headers, params, body) {
    let ret = { "msg": "done" };
    let eventType = headers["x-github-event"];
    debug("[handleGitHubWebhooks] eventType", eventType);
    utils.writeTmpOutputFileOnDevelopment(body);

    switch (eventType) {
        case 'push':
            await feishuService.sendPushEventNotification(body);
            break;
        case 'issues':
            await feishuService.sendIssuesEventNotification(body);
            break;
        case 'issue_comment':
            await feishuService.sendIssueCommentEventNotification(body);
            break;
        case 'fork':
            await feishuService.sendForkEventNotification(body);
            break;
        case 'pull_request':
            await feishuService.sendPullRequestEventNotification(body);
            break;
        case 'milestone':
            await feishuService.sendMilestoneEventNotification(body);
            break;
        default:
            console.log("[handleGitHubWebhooks] unhandled event", eventType);
    }


    debug("[handleGitHubWebhooks] ret", JSON.stringify(ret))
    return ret;
}



exports = module.exports = new Controller();