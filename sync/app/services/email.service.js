/**
 * Send Emails
 */


const debug = require("debug")("sync:services:email");
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const utils = require("../utils/index");

const SMTP_HOST = process.env["SMTP_HOST"];
const SMTP_PORT = process.env["SMTP_PORT"];
const SMTP_SSL = process.env["SMTP_SSL"];
const SMTP_USER_FROM = process.env["SMTP_USER_FROM"];
const SMTP_USER_NAME = process.env["SMTP_USER_NAME"];
const SMTP_USER_PASS = process.env["SMTP_USER_PASS"];
const MAIL_W3_EVENTS_CC = process.env["MAIL_W3_EVENTS_CC"];
const MAIL_W3_EVENTS_BCC = process.env["MAIL_W3_EVENTS_BCC"];
const BRAND_SUFFIX = process.env["BRAND_SUFFIX"] || "春松客服 W3";

const transport = nodemailer.createTransport(smtpTransport({
    host: SMTP_HOST, // 服务
    port: SMTP_PORT, // smtp端口
    secure: SMTP_SSL,
    auth: {
        user: SMTP_USER_FROM, // 用户名
        pass: SMTP_USER_PASS // SMTP授权码
    }
}));

/**
 * Send Mail
 * @param {*} options 
 * @returns 
 */
function send(options) {
    debug("[send] %j", options)

    return new Promise((resolve, reject) => {
        transport.sendMail({
            from: `${SMTP_USER_NAME}<${SMTP_USER_FROM}>`, // 发件邮箱
            to: options.to, // 收件列表
            bcc: options.bcc, // 收件列表
            subject: options.subject, // 标题
            html: options.html,
            attachments: options.attachment ? [{ path: options.attachment }] : null,
        },
            (error, data) => {
                if (error) return reject(error)
                resolve(data)
            })
    })

}

/**
 * 发送 W3 服务通知
 * @param {*} payload 
 */
async function sendW3BroadcastMaillists(payload) {

    if (!MAIL_W3_EVENTS_CC) {
        debug("[sendW3BroadcastMaillists] not set ENV MAIL_W3_EVENTS_CC, bypass broadcast.");
        return;
    }

    await send({
        to: MAIL_W3_EVENTS_CC,
        bcc: MAIL_W3_EVENTS_BCC,
        subject: utils.capitalizeFirstLetter(utils.getW3PostCategories(payload) + " - ") + payload.display_name + " - " + payload.post_title + " | " + BRAND_SUFFIX,
        html: `  LINK: ${payload.link} <br />
  AUTHOR: ${payload.display_name}(${payload.user_email}) <br />
  PROFILE: ${payload.user_profile} <br />
  <br />
  CONTENT: <br />
  ${payload.content} <br />

  <br />
  <br />
        `
    })
}

exports = module.exports = {
    send,
    sendW3BroadcastMaillists
}