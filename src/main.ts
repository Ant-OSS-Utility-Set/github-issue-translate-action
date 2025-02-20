import * as core from '@actions/core'
import * as github from '@actions/github'
import {Md5} from 'ts-md5'
import marked from 'marked'

import {createIssueComment, updateIssue, translate, isEnglish} from './utils'
import getModel from './modes'
import {translateText} from './utils/translate'

const TRANSLATE_TITLE_DIVING = `||`
const ORIGINAL_MD5_PREFIX = `<!--MD5:`
const ORIGINAL_MD5_POSTFIX = `:MD5-->`
const ORIGIN_CONTENT_PREFIX = `<details><summary>原文</summary>`
const REPLAY_PREFIX1 = `> 原文`
const ORIGIN_CONTENT_POSTFIX = `</details>`
const UPDATED_FLAG = `</hide>`
const DEFAULT_BOT_MESSAGE = `    Github Action Bot detected the issue body's language is not English, translate it automatically\n---\n`
const REPLAY_FOR_REPLACE_BOT = `> Github Action Bot detected the issue body's language is not English, translate it automatically`
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

  let {match, title, body, update} = model

  if (!match) {
    return
  }
  if (typeof body == 'undefined' || body == null) {
    core.info('body 读取为空，直接返回')
    return
  }

  const octokit = github.getOctokit(botToken)
  const originTitle = title?.split(TRANSLATE_TITLE_DIVING)?.[0]
  let originComment = body
  if (body.indexOf(ORIGINAL_MD5_PREFIX) > -1) {
    originComment = body.slice(
      body.indexOf(ORIGIN_CONTENT_PREFIX) + ORIGIN_CONTENT_PREFIX.length,
      body.indexOf(ORIGIN_CONTENT_POSTFIX)
    )
  }

  originComment = originComment.replace(REPLAY_PREFIX1, '')
  originComment = originComment.replace(REPLAY_FOR_REPLACE_BOT, '')

  const titleContentUnionText = translateText.stringify(
    originComment,
    originTitle
  )

  //对比md5和原文是否一致
  const isNotModified = checkMd5(body, originComment)
  if (isNotModified) {
    return
  }

  // translate issue comment body to english
  const translateString = await translate(titleContentUnionText)
  if (!translateString || translateString == titleContentUnionText) {
    return core.warning('The translateBody is null or same, ignore return.')
  }

  let [translateTitle, translateComment] = translateText.parse(translateString)
  const isTransSameFlag = isTransSameText(originComment, translateComment)
  if (isTransSameFlag) {
    return
  }

  //替换翻译后的markdown文本为html文本，并改变md5
  console.log('替换前的内容：' + originComment)
  //替换markdown语法转换为HTML标签
  const parsedComment = await marked.parse(originComment)
  console.log('替换后的html内容：' + parsedComment)
  const md5Text =
    ORIGINAL_MD5_PREFIX + Md5.hashStr(parsedComment) + ORIGINAL_MD5_POSTFIX

  // 拼接字符串
  body = `${DEFAULT_BOT_MESSAGE}${translateComment}${ORIGIN_CONTENT_PREFIX}${parsedComment}${ORIGIN_CONTENT_POSTFIX}${md5Text}`

  if (translateTitle && originTitle !== translateTitle) {
    title = [originTitle, translateTitle].join(TRANSLATE_TITLE_DIVING)
  }
  await update(octokit, body || undefined, title || undefined)
  core.setOutput('complete time', new Date().toTimeString())
}

//工具函数

function checkMd5(body: string, titleContentOrigin: string) {
  const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX)
  let newMd5 = Md5.hashStr(titleContentOrigin)

  if (startIndex > -1) {
    // md5
    const startIndex = body.indexOf(ORIGINAL_MD5_PREFIX)
    const endIndex = body.indexOf(ORIGINAL_MD5_POSTFIX)
    const originalMd5 = body.slice(
      startIndex + ORIGINAL_MD5_PREFIX.length,
      endIndex
    )

    if (originalMd5 === newMd5) {
      core.info('原文不变，不需要edit')
      return true
    } else {
      core.info('2个md5不一致，需要重新翻译提交！')
      return false
    }
  }
  return false
}

function isTransSameText(
  originComment: string,
  translateComment: string | undefined
) {
  //如果originComment的前20个字符和translateComment的前20个字符一样，就不用翻译了
  if (
    originComment &&
    translateComment &&
    originComment.length == translateComment.length
  ) {
    core.info('内容一样，不需要翻译')
    return true
  }

  if (
    originComment &&
    translateComment &&
    originComment.length > 20 &&
    translateComment.length > 20
  ) {
    const originCommentStart = originComment.substring(0, 20)
    const translateCommentStart = translateComment.substring(0, 20)
    if (originCommentStart === translateCommentStart) {
      core.info('前20个字符一样，不需要翻译')
      return true
    }
  }
  return false
}

async function run() {
  try {
    await main()
  } catch (err: any) {
    core.setFailed(err.message)
  }
}

run()
