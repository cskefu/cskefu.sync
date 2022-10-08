/**
 * W3 Ctrl
 */

const debug = require("debug")("sync:ctrl:w3");
const utils = require("../utils/index");
const feishuService = require("../services/feishu.service");



function Controller() {

}

/**
 * Handle W3 Events
 * @param {*} headers
 * @param {*} params
 * @param {*} body
 */
Controller.prototype.handleW3broadcast = async function (headers, params, body) {
    let ret = { "msg": "done" };
    /**
     *   sync:routes:w3 /broadcast ctx.params {} , body
{
 "link": "https://www.cskefu.com/2022/10/08/test-c/",
 "post_title": "Test C",
 "author_id": "99",
 "display_name": "Hai",
 "user_email": "h@cskefu.com",
 "user_profile": "https://www.cskefu.com/user/99/",
 "categories": [
   {
     "term_id": 118,
     "name": "业务观点",
     "slug": "business",
     "term_group": 0,
     "term_taxonomy_id": 118,
     "taxonomy": "category",
     "description": "业务、产品及服务的应用和解决方案：呼叫中心、联络中心、智能客服、客服机器人、CTI、云计算等。有价值的干货：应用场景、业务价
值、创新方案。",
     "parent": 0,
     "count": 12,
     "filter": "raw",
     "cat_ID": 118,
     "category_count": 12,
     "category_description": "业务、产品及服务的应用和解决方案：呼叫中心、联络中心、智能客服、客服机器人、CTI、云计算等。有价值的干货：应用场
景、业务价值、创新方案。",
     "cat_name": "业务观点",
     "category_nicename": "business",
     "category_parent": 0
   },
   {
     "term_id": 145,
     "name": "产品专栏",
     "slug": "product",
     "term_group": 0,
     "term_taxonomy_id": 145,
     "taxonomy": "category",
     "description": "产品理念、产品设计、产品构想等；主要由春松客服产品经理或产品办公室发布。",
     "parent": 0,
     "count": 2,
     "filter": "raw",
     "cat_ID": 145,
     "category_count": 2,
     "category_description": "产品理念、产品设计、产品构想等；主要由春松客服产品经理或产品办公室发布。",
     "cat_name": "产品专栏",
     "category_nicename": "product",
     "category_parent": 0
   }
 ]
}
     */
    utils.writeTmpOutputFileOnDevelopment(body);

    // 发送 W3 文章通知到飞书群
    await feishuService.sendW3BroadcastNotification(body);


    debug("[handleW3broadcast] ret", JSON.stringify(ret))
    return ret;
}



exports = module.exports = new Controller();