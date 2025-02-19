import * as core from '@actions/core'
import * as github from '@actions/github'
import {Md5} from 'ts-md5'

import {createIssueComment, updateIssue, translate} from './utils'
import getModel from './modes'
import {translateText} from './utils/translate'

const TRANSLATE_TITLE_DIVING = `||`
const ORIGINAL_MD5_PREFIX = `<!--MD5:`
const ORIGINAL_MD5_POSTFIX = `:MD5-->`
const ORIGIN_CONTENT_PREFIX = `<details><summary>原文</summary>`
const ORIGIN_CONTENT_POSTFIX = `</details>`
const DEFAULT_BOT_MESSAGE = `Github Action Bot detected the issue body's language is not English, translate it automatically`
const DEFAULT_BOT_TOKEN = process.env.GITHUB_TOKEN

async function main(): Promise<void> {
  const isModifyTitle = core.getInput('IS_MODIFY_TITLE')
  const shouldAppendContent = core.getInput('APPEND_TRANSLATION')
  const botNote = DEFAULT_BOT_MESSAGE
  // ignore when bot comment issue himself
  const botToken = DEFAULT_BOT_TOKEN
  if (!botToken) {
    return core.info(`GITHUB_TOKEN is requried!`)
  }

  const model = getModel()
  if (!model) {
    return
  }

  let {match, title, body, update, isUpdated} = model
  console.log('是否被更新过：' + isUpdated)
  if ('yes' == isUpdated) {
    core.info('已经翻译过了：' + isUpdated)
    return
  }
  if (!match) {
    return
  }
  if (typeof body == 'undefined' || body == null) {
    core.info('body 读取为空，直接返回')
    return
  }

  const octokit = github.getOctokit(botToken)
  const originTitle = title?.split(TRANSLATE_TITLE_DIVING)?.[0]
  // @ts-ignore解析出来原始数据,test

  let originComment = body
  if (body.indexOf(ORIGINAL_MD5_PREFIX) > -1) {
    originComment = body.slice(
      body.indexOf(ORIGIN_CONTENT_PREFIX) + ORIGIN_CONTENT_PREFIX.length,
      body.indexOf(ORIGIN_CONTENT_POSTFIX)
    )
    // console.log(
    //   '原来的body内容：' +
    //     body +
    //     ';startindex:' +
    //     body.indexOf(ORIGIN_CONTENT_PREFIX) +
    //     ORIGIN_CONTENT_PREFIX.length +
    //     ';endindex:' +
    //     body.indexOf(ORIGIN_CONTENT_POSTFIX)
    // )
  }

  const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX)

  const titleContentOrigin = translateText.stringify(originComment, originTitle)
  let newMd5 = Md5.hashStr(titleContentOrigin)
  const translateOrigin_MD5 =
    ORIGINAL_MD5_PREFIX + newMd5 + ORIGINAL_MD5_POSTFIX
  if (startIndex > -1) {
    // core.info('比较md5开始：')
    //md5
    const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX)
    const endIndex = body.indexOf(ORIGINAL_MD5_POSTFIX)
    const originalMd5 = body.slice(
      startIndex + ORIGINAL_MD5_PREFIX.length,
      endIndex
    )
    //
    // core.info('旧的原文md5:' + originalMd5)
    // core.info('新的原文md5:' + newMd5)
    if (originalMd5 === newMd5) {
      core.info('原文不变，不需要edit')
      return
    } else {
      core.info('2个md5不一致，需要重新翻译提交！')
    }

    //md5 end
  }

  // translate issue comment body to english
  const translateTmp = await translate(titleContentOrigin)
  if (!translateTmp || translateTmp == titleContentOrigin) {
    return core.warning('The translateBody is null or same, ignore return.')
  }

  let [translateTitle, translateComment] = translateText.parse(translateTmp)

  if (translateTitle && originTitle !== translateTitle) {
    title = [originTitle, translateTitle].join(TRANSLATE_TITLE_DIVING)
  }

  //如果originComment的前20个字符和translateComment的前20个字符一样，就不用翻译了
  if (
    originComment &&
    translateComment &&
    originComment.length == translateComment.length
  ) {
    core.info('内容一样，不需要翻译')
    return
  }

  if (
    originComment &&
    translateComment &&
    originComment.length > 10 &&
    translateComment.length > 10
  ) {
    const originCommentStart = originComment.substring(0, 10)
    const translateCommentStart = translateComment.substring(0, 10)
    if (originCommentStart === translateCommentStart) {
      core.info('前20个字符一样，不需要翻译')
      return
    }
  }

  if (translateComment && originComment != translateComment) {
    // console.log('替换前的内容：' + originComment)
    // //替换markdown语法转换为HTML标签
    // originComment = replaceMarkdownSyntax(originComment)
    // console.log('替换后的内容：' + originComment)
    // 拼接字符串
    body = `    ${DEFAULT_BOT_MESSAGE}
---
${translateComment}
${ORIGIN_CONTENT_PREFIX}${originComment}${ORIGIN_CONTENT_POSTFIX}
${translateOrigin_MD5}`
  }

  await update(octokit, body || undefined, title || undefined, 'yes')
  core.setOutput('complete time', new Date().toTimeString())
}

//工具函数
function replaceMarkdownSyntax(input: string): string {
  // 正则表达式匹配Markdown语法标识符
  const markdownSyntaxRegex = /(\*|_|\`|>|#|\[|\])+/g
  // 替换函数，将匹配到的Markdown语法标识符替换为HTML的对应标签

  const handlePairs = (match: string) => {
    const openingTag = match[1]
    const closingTag =
      openingTag === '*'
        ? '</em>'
        : openingTag === '_'
        ? '</strong>'
        : '</code>'
    return `<${openingTag}>${match.substring(
      2,
      match.length - 2
    )}</${closingTag}>`
  }

  const replaceFunction = (match: string, p1: string) => {
    // 根据匹配到的字符类型，生成对应的HTML标签
    switch (p1) {
      case '*':
        return '<em>'
      case '_':
        return '<strong>'
      case '`':
        return '<code>'
      case '>':
        return '<blockquote>'
      case '#':
        return '<h1>'
      case '[':
        return '<a href="">'
      case ']':
        return '</a>'
      default:
        // // 如果匹配到的字符是成对标识的开始，处理成对标识
        if (p1 === '*' || p1 === '_' || p1 === '`') {
          return handlePairs(match)
        }
        return ''
    }
  }
  // 使用replace方法进行替换
  return input.replace(markdownSyntaxRegex, replaceFunction)
}

async function run() {
  try {
    await main()
  } catch (err: any) {
    core.setFailed(err.message)
  }
}

run()
