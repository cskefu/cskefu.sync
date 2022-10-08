
const debug = require("debug")("sync:utils:index");

const os = require("os");
const fs = require('fs');

function genTempdir() {
    return os.tmpdir();
}

function genTimestamp() {
    return new Date().getTime();
}

function writeJsonFile(obj, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

function isNodeEnvDevelopment() {
    if (process.env["NODE_ENV"] && process.env["NODE_ENV"] == "development")
        return true;
}

function writeTmpOutputFileOnDevelopment(obj) {
    if (isNodeEnvDevelopment()) {
        let tmpFilePath = `${genTempdir()}/sync_tmp_${genTimestamp()}.json`
        debug("[writeTmpOutputFileOnDevelopment] write content to tmpFilePath", tmpFilePath)
        writeJsonFile(obj, tmpFilePath);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



/**
* 获得 W3 文章标签分类信息
* @param {*} payload 
*/
function getW3PostCategories(payload) {
    if (payload.categories && payload.categories.length > 0) {
        let ret = [];

        for (let x of payload.categories) {
            ret.push(x.name);
        }

        return ret.join("_")
    } else {
        return "未分类"
    }
}


exports = module.exports = {
    genTempdir,
    genTimestamp,
    writeJsonFile,
    isNodeEnvDevelopment,
    writeTmpOutputFileOnDevelopment,
    capitalizeFirstLetter,
    getW3PostCategories
}