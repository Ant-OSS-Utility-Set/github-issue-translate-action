import './sourcemap-register.cjs';/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

var __createBinding = (undefined && undefined.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (undefined && undefined.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (undefined && undefined.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (undefined && undefined.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const ts_md5_1 = require("ts-md5");
const marked_1 = __importDefault(require("marked"));
const utils_1 = require("./utils");
const modes_1 = __importDefault(require("./modes"));
const translate_1 = require("./utils/translate");
const TRANSLATE_TITLE_DIVING = `||`;
const ORIGINAL_MD5_PREFIX = `<!--MD5:`;
const ORIGINAL_MD5_POSTFIX = `:MD5-->`;
const ORIGIN_CONTENT_PREFIX = `<details><summary>原文</summary>`;
const REPLAY_PREFIX1 = `> 原文`;
const REPLAY_PREFIX2 = `> <details><summary>原文</summary>`;
const ORIGIN_CONTENT_POSTFIX = `</details>`;
const UPDATED_FLAG = (/* unused pure expression or super */ null && (`</hide>`));
const DEFAULT_BOT_MESSAGE = `Github Action Bot detected the issue body's language is not English, translate it automatically`;
const DEFAULT_BOT_TOKEN = process.env.GITHUB_TOKEN;
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const isModifyTitle = core.getInput('IS_MODIFY_TITLE');
        const shouldAppendContent = core.getInput('APPEND_TRANSLATION');
        const botNote = DEFAULT_BOT_MESSAGE;
        // ignore when bot comment issue himself
        const botToken = DEFAULT_BOT_TOKEN;
        if (!botToken) {
            return core.info(`GITHUB_TOKEN is requried!`);
        }
        const model = (0, modes_1.default)();
        if (!model) {
            return;
        }
        let { match, title, body, update } = model;
        if (!match) {
            return;
        }
        if (typeof body == 'undefined' || body == null) {
            core.info('body 读取为空，直接返回');
            return;
        }
        const octokit = github.getOctokit(botToken);
        const originTitle = (_a = title === null || title === void 0 ? void 0 : title.split(TRANSLATE_TITLE_DIVING)) === null || _a === void 0 ? void 0 : _a[0];
        let originComment = body;
        if (body.indexOf(ORIGINAL_MD5_PREFIX) > -1) {
            originComment = body.slice(body.indexOf(ORIGIN_CONTENT_PREFIX) + ORIGIN_CONTENT_PREFIX.length, body.indexOf(ORIGIN_CONTENT_POSTFIX));
        }
        if (originComment.indexOf(REPLAY_PREFIX1) > -1) {
            console.log("REPLAY_PREFIX1 ");
            originComment = originComment.slice(originComment.indexOf(REPLAY_PREFIX1) + REPLAY_PREFIX1.length);
        }
        if (originComment.indexOf(REPLAY_PREFIX2) > -1) {
            console.log("REPLAY_PREFIX2 ");
            originComment = originComment.slice(originComment.indexOf(REPLAY_PREFIX2) + REPLAY_PREFIX2.length);
        }
        const titleContentUnionText = translate_1.translateText.stringify(originComment, originTitle);
        //对比md5和原文是否一致
        const isNotModified = checkMd5(body, originComment);
        if (isNotModified) {
            return;
        }
        // translate issue comment body to english
        const translateString = yield (0, utils_1.translate)(titleContentUnionText);
        if (!translateString || translateString == titleContentUnionText) {
            return core.warning('The translateBody is null or same, ignore return.');
        }
        let [translateTitle, translateComment] = translate_1.translateText.parse(translateString);
        const isTransSameFlag = isTransSameText(originComment, translateComment);
        if (isTransSameFlag) {
            return;
        }
        //替换翻译后的markdown文本为html文本，并改变md5
        console.log('替换前的内容：' + originComment);
        //替换markdown语法转换为HTML标签
        const parsedComment = yield marked_1.default.parse(originComment);
        console.log('替换后的html内容：' + parsedComment);
        const md5Text = ORIGINAL_MD5_PREFIX + ts_md5_1.Md5.hashStr(parsedComment) + ORIGINAL_MD5_POSTFIX;
        // 拼接字符串
        body = `    ${DEFAULT_BOT_MESSAGE}
---
${translateComment}
${ORIGIN_CONTENT_PREFIX}${parsedComment}${ORIGIN_CONTENT_POSTFIX}${md5Text}`;
        if (translateTitle && originTitle !== translateTitle) {
            title = [originTitle, translateTitle].join(TRANSLATE_TITLE_DIVING);
        }
        yield update(octokit, body || undefined, title || undefined);
        core.setOutput('complete time', new Date().toTimeString());
    });
}
//工具函数
function checkMd5(body, titleContentOrigin) {
    const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX);
    let newMd5 = ts_md5_1.Md5.hashStr(titleContentOrigin);
    if (startIndex > -1) {
        // md5
        const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX);
        const endIndex = body.indexOf(ORIGINAL_MD5_POSTFIX);
        const originalMd5 = body.slice(startIndex + ORIGINAL_MD5_PREFIX.length, endIndex);
        if (originalMd5 === newMd5) {
            core.info('原文不变，不需要edit');
            return true;
        }
        else {
            core.info('2个md5不一致，需要重新翻译提交！');
            return false;
        }
    }
    return false;
}
function isTransSameText(originComment, translateComment) {
    //如果originComment的前20个字符和translateComment的前20个字符一样，就不用翻译了
    if (originComment &&
        translateComment &&
        originComment.length == translateComment.length) {
        core.info('内容一样，不需要翻译');
        return true;
    }
    if (originComment &&
        translateComment &&
        originComment.length > 20 &&
        translateComment.length > 20) {
        const originCommentStart = originComment.substring(0, 20);
        const translateCommentStart = translateComment.substring(0, 20);
        if (originCommentStart === translateCommentStart) {
            core.info('前20个字符一样，不需要翻译');
            return true;
        }
    }
    return false;
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield main();
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
run();


//# sourceMappingURL=index.js.map