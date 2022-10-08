/**
 * Feishu Service
 */

const debug = require("debug")("sync:services:feishu");
const axios = require("axios").default;
const _ = require("lodash");
const utils = require("../utils/index");
const moment = require('moment-timezone');

const TZ = 'Asia/Shanghai'
const FEISHU_GROUP_GITHUB_BOTS = process.env["FEISHU_GROUP_GITHUB_BOTS"] ? process.env["FEISHU_GROUP_GITHUB_BOTS"].split(",") : null;
const FEISHU_GROUP_W3_BOTS = process.env["FEISHU_GROUP_W3_BOTS"] ? process.env["FEISHU_GROUP_W3_BOTS"].split(",") : null;

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


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
        debug("[sendPushEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
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

        case "milestoned":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.issue.number}  ${payload.issue.title}](${payload.issue.html_url})\n**milestone** [M${payload.milestone.number} ${payload.milestone.title}](${payload.milestone.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
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


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
        debug("[sendIssuesEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
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


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
        debug("[sendIssueCommentEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
    }
}

/**
 * send Issues Event
 * @param {*} payload 
 */
async function sendForkEventNotification(payload) {
    debug("[sendForkEventNotification]", JSON.stringify(payload.forkee));
    let elements = [];

    elements.push({
        "tag": "div",
        "text": {
            "content": `**forkee** [${payload.forkee.owner.login}](${payload.forkee.owner.html_url})\n**forked** [${payload.forkee.full_name}](${payload.forkee.html_url})`,
            "tag": "lark_md"
        }
    })

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "🍕 Open on GitHub",
                "tag": "lark_md"
            },
            "url": `${payload.forkee.html_url}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
                            "content": utils.capitalizeFirstLetter("forked ") + payload.repository.full_name,
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendForkEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendForkEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
    }
}

/**
 * send PR Event
 * @param {*} payload 
 */
async function sendPullRequestEventNotification(payload) {
    debug("[sendPullRequestEventNotification]", JSON.stringify(payload.action));
    let elements = [];

    switch (payload.action) {
        case "opened":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.pull_request.number} ${payload.pull_request.title}](${payload.pull_request.html_url}) \n**open** by [${payload.pull_request.user.login}](${payload.pull_request.user.html_url}) \n**labels** ${payload.pull_request.labels.length > 0 ? getIssueLabels(payload.pull_request.labels) : 'N/A'}\n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
            break;

        case "review_requested":
        case "review_request_removed":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.pull_request.number} ${payload.pull_request.title}](${payload.pull_request.html_url}) \n**reviewer** [${payload.requested_reviewer.login}](${payload.requested_reviewer.html_url}) \n**open** by [${payload.pull_request.user.login}](${payload.pull_request.user.html_url}) \n**labels** ${payload.pull_request.labels.length > 0 ? getIssueLabels(payload.pull_request.labels) : 'N/A'}\n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
            break;
        case "labeled":
            // bypass labeled events
            return;

        case "milestoned":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.pull_request.number}  ${payload.pull_request.title}](${payload.pull_request.html_url})\n**milestone** [M${payload.milestone.number} ${payload.milestone.title}](${payload.milestone.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
            break;
        default:
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [#${payload.pull_request.number}  ${payload.pull_request.title}](${payload.pull_request.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
    }

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "💻 Open on GitHub",
                "tag": "lark_md"
            },
            "url": `${payload.pull_request.html_url}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
                            "content": utils.capitalizeFirstLetter(payload.action) + " pull request " + payload.repository.full_name + ` #${payload.pull_request.number} 💌`,
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendPullRequestEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendPullRequestEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
    }
}


/**
 * send Milestone Event
 * @param {*} payload 
 */
async function sendMilestoneEventNotification(payload) {
    debug("[sendMilestoneEventNotification]", JSON.stringify(payload.action));
    let elements = [];

    switch (payload.action) {
        case "created":
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [M${payload.milestone.number} ${payload.milestone.title}](${payload.milestone.html_url}) \n**open** by [${payload.milestone.creator.login}](${payload.milestone.creator.html_url}) \n**description** ${payload.milestone.description || 'N/A'}\n**due on** ${moment.utc(payload.milestone.due_on).tz(TZ).format('YYYY-MM-DD')}`,
                    "tag": "lark_md"
                }
            })
            break;

        default:
            elements.push({
                "tag": "div",
                "text": {
                    "content": `**${payload.action}** [M${payload.milestone.number}  ${payload.milestone.title}](${payload.milestone.html_url}) \n**sender** [${payload.sender.login}](${payload.sender.html_url})`,
                    "tag": "lark_md"
                }
            })
    }

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "🎡 Open on GitHub",
                "tag": "lark_md"
            },
            "url": `${payload.milestone.html_url}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (FEISHU_GROUP_GITHUB_BOTS && FEISHU_GROUP_GITHUB_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_GITHUB_BOTS) {
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
                            "content": utils.capitalizeFirstLetter(payload.action) + " milestone " + payload.repository.full_name + ` M${payload.milestone.number} ${payload.milestone.title}💌`,
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendMilestoneEventNotification] resp %j", response.data)
        }
    } else {
        debug("[sendMilestoneEventNotification] No notify group defined with ENV FEISHU_GROUP_GITHUB_BOTS");
    }
}

/**
 * Send W3 Post Events into Feishu Groups
 * @param {*} payload 
 */
async function sendW3BroadcastNotification(payload) {
    debug("[sendW3BroadcastNotification]", JSON.stringify(payload));
    let elements = [];

    elements.push({
        "tag": "div",
        "text": {
            "content": `**标题** ${payload.post_title}\n**作者** [${payload.display_name}(${payload.user_email})](${payload.user_profile})\n**正文**\n ${payload.content.substring(0, 60)}...`,
            "tag": "lark_md"
        }
    })

    elements.push({
        "actions": [{
            "tag": "button",
            "text": {
                "content": "✅ 阅读原文",
                "tag": "lark_md"
            },
            "url": `${payload.link}`,
            "type": "default",
            "value": {}
        }],
        "tag": "action"
    })


    if (FEISHU_GROUP_W3_BOTS && FEISHU_GROUP_W3_BOTS.length > 0) {
        for (let notify_feishu_group of FEISHU_GROUP_W3_BOTS) {
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
                            "content": utils.capitalizeFirstLetter(utils.getW3PostCategories(payload) + " - ") + payload.post_title + " | 春松客服 W3",
                            "tag": "plain_text"
                        }
                    }
                }
            });
            debug("[sendW3BroadcastNotification] resp %j", response.data)
        }
    } else {
        debug("[sendW3BroadcastNotification] No notify group defined with ENV FEISHU_GROUP_W3_BOTS");
    }
}


exports = module.exports = {
    sendPushEventNotification,
    sendIssuesEventNotification,
    sendIssueCommentEventNotification,
    sendForkEventNotification,
    sendPullRequestEventNotification,
    sendMilestoneEventNotification,
    sendW3BroadcastNotification
}
