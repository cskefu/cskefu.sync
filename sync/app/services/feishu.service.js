/**
 * Feishu Service
 */

const debug = require("debug")("sync:services:feishu");
const axios = require("axios").default;

const NOTIFY_FEISHU_GROUPS = process.env["NOTIFY_FEISHU_GROUPS"] ? process.env["NOTIFY_FEISHU_GROUPS"].split(",") : null;


/**
 * Send Event notification
 * @param {*} payload 
 */
async function sendPushEventNotification(payload) {
    debug("[sendPushEventNotification]", JSON.stringify(payload.pusher));

    if (NOTIFY_FEISHU_GROUPS && NOTIFY_FEISHU_GROUPS.length > 0) {
        for (let notify_feishu_group of NOTIFY_FEISHU_GROUPS) {
            // Check out payload body for message conent with
            // https://github.com/cskefu/cskefu.sync/issues/2
            let response = await axios.post(notify_feishu_group, {
                "msg_type": "post",
                "content": {
                    "post": {
                        "zh_cn": {
                            "title": "Project update notification",
                            "content": [
                                [{
                                    "tag": "text",
                                    "text": "Project is updated: "
                                },
                                {
                                    "tag": "a",
                                    "text": "See",
                                    "href": "http://www.example.com/"
                                },
                                {
                                    "tag": "at",
                                    "user_id": "ou_18eac8********17ad4f02e8bbbb"
                                }
                                ]
                            ]
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



exports = module.exports = {
    sendPushEventNotification
}