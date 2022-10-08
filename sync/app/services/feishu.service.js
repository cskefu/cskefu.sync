/**
 * Feishu Service
 */

const debug = require("debug")("sync:services:feishu");
const axios = require("axios").default;
const _ = require("lodash");
const utils = require("../utils/index");
const sanitizeHtml = require('sanitize-html');

const NOTIFY_FEISHU_GROUPS = process.env["NOTIFY_FEISHU_GROUPS"] ? process.env["NOTIFY_FEISHU_GROUPS"].split(",") : null;


/**
 * Compose Push Event Content
 * @param {*} payload 
 * @returns 
 */
function composePushEventNotificationContent(payload) {
    let content = [];

    for (let commit of payload.commits) {
        content.push({
            "tag": "div",
            "text": {
                "content": `[${commit.id.substring(0, 6)}](${commit.url}): ${commit.message} - ${commit.committer.name}(${commit.committer.email})`,
                "tag": "lark_md"
            }
        });
    }

    return content;
}

/**
 * Send Event notification
 * @param {*} payload 
 */
async function sendPushEventNotification(payload) {
    debug("[sendPushEventNotification]", JSON.stringify(payload.pusher));
    let splits = payload.ref.split("/")
    let branch = splits[splits.length - 1]
    let elements = composePushEventNotificationContent(payload);
    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "💬 Compare",
                "tag": "lark_md"
            },
            "url": `${payload.compare}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (NOTIFY_FEISHU_GROUPS && NOTIFY_FEISHU_GROUPS.length > 0) {
        for (let notify_feishu_group of NOTIFY_FEISHU_GROUPS) {
            // Check out payload body for message conent with
            // https://github.com/cskefu/cskefu.sync/issues/2
            let response = await axios.post(notify_feishu_group, {
                "msg_type": "interactive",
                "card": {
                    "config": {
                        "wide_screen_mode": true,
                        "enable_forward": true
                    },
                    "elements": elements,
                    "header": {
                        "title": {
                            "content": "Pushed " + payload.repository.full_name + ":" + branch + " 🏆",
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendPushEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendPushEventNotification] No notify group defined with ENV NOTIFY_FEISHU_GROUPS");
    }
}


/**
 * Get Issue lable string
 * @param {*} labels 
 * @returns 
 */
function getIssueLabels(labels) {
    let ret = []

    for (let x of labels) {
        ret.push(x.name)
    }

    return ret.join(",")
}


/**
 * send Issues Event
 * @param {*} payload 
 */
async function sendIssuesEventNotification(payload) {
    debug("[sendIssuesEventNotification]", JSON.stringify(payload.action));
    let elements = [];

    switch (payload.action) {

        case "opened":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number} ${payload.issue.title}](${payload.issue.html_url}) \n**open** by [${payload.issue.user.login}](${payload.issue.user.html_url}) \n**labels** ${payload.issue.labels.length > 0 ? getIssueLabels(payload.issue.labels) : 'N/A'}`,
                    "tag": "lark_md"
                }
            })
            break;

        case "assigned":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number} ${payload.issue.title}](${payload.issue.html_url}) \n**assignee** [${payload.issue.assignee.login}](${payload.issue.assignee.html_url}) \n**open** by [${payload.issue.user.login}](${payload.issue.user.html_url}) \n**labels** ${payload.issue.labels.length > 0 ? getIssueLabels(payload.issue.labels) : 'N/A'}`,
                    "tag": "lark_md"
                }
            })
            break;
        case "labeled":
            // bypass labeled events
            return;
        default:
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number}  ${payload.issue.title}](${payload.issue.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
    }

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "☕ Open on GitHub",
                "tag": "lark_md"
            },
            "url": `${payload.issue.html_url}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (NOTIFY_FEISHU_GROUPS && NOTIFY_FEISHU_GROUPS.length > 0) {
        for (let notify_feishu_group of NOTIFY_FEISHU_GROUPS) {
            // Check out payload body for message conent with
            // https://github.com/cskefu/cskefu.sync/issues/2
            let response = await axios.post(notify_feishu_group, {
                "msg_type": "interactive",
                "card": {
                    "config": {
                        "wide_screen_mode": true,
                        "enable_forward": true
                    },
                    "elements": elements,
                    "header": {
                        "title": {
                            "content": utils.capitalizeFirstLetter(payload.action) + " issue " + payload.repository.full_name + ` #${payload.issue.number} 💌`,
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendIssuesEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendIssuesEventNotification] No notify group defined with ENV NOTIFY_FEISHU_GROUPS");
    }
}

/**
 * send Issues Event
 * @param {*} payload 
 */
async function sendIssueCommentEventNotification(payload) {
    debug("[sendIssueCommentEventNotification]", JSON.stringify(payload.action));
    let elements = [];

    switch (payload.action) {
        case "created":
        case "edited":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number} ${payload.issue.title}](${payload.issue.html_url}) \n**open** by [${payload.issue.user.login}](${payload.issue.user.html_url}) \n**labels** ${payload.issue.labels.length > 0 ? getIssueLabels(payload.issue.labels) : 'N/A'}\n**comment** by [${payload.comment.user.login}](${payload.comment.user.html_url})\n${payload.comment.body}`,
                    "tag": "lark_md"
                }
            })
            break;

        default:
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number}  ${payload.issue.title}](${payload.issue.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
    }

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "☕ Open on GitHub",
                "tag": "lark_md"
            },
            "url": `${payload.issue.html_url}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (NOTIFY_FEISHU_GROUPS && NOTIFY_FEISHU_GROUPS.length > 0) {
        for (let notify_feishu_group of NOTIFY_FEISHU_GROUPS) {
            // Check out payload body for message conent with
            // https://github.com/cskefu/cskefu.sync/issues/2
            let response = await axios.post(notify_feishu_group, {
                "msg_type": "interactive",
                "card": {
                    "config": {
                        "wide_screen_mode": true,
                        "enable_forward": true
                    },
                    "elements": elements,
                    "header": {
                        "title": {
                            "content": utils.capitalizeFirstLetter(payload.action) + " comment " + payload.repository.full_name + ` #${payload.issue.number} 💌`,
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendIssueCommentEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendIssueCommentEventNotification] No notify group defined with ENV NOTIFY_FEISHU_GROUPS");
    }
}



exports = module.exports = {
    sendPushEventNotification,
    sendIssuesEventNotification,
    sendIssueCommentEventNotification
}