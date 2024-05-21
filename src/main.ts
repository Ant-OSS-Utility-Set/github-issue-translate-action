import * as core from '@actions/core'
import * as github from '@actions/github'
import {Md5} from 'ts-md5'

import {createIssueComment, updateIssue, translate} from './utils'
import getModel from './modes'
import {translateText} from './utils/translate'

const TRANSLATE_TITLE_DIVING = `||`
const ORIGINAL_MD5_PREFIX = `<!--MD5:`
const ORIGINAL_MD5_POSTFIX = `:MD5-->`
const TRANSLATE_DIVIDING_LINE = `<!--This is a translation content dividing line, the content below is generated by machine, please do not modify the content below-->`
//. 👯👭🏻🧑‍🤝‍🧑👫🧑🏿‍🤝‍🧑🏻👩🏾‍🤝‍👨🏿👬🏿
const DEFAULT_BOT_MESSAGE = `Bot detected the issue body's language is not English, translate it automatically:`
const DEFAULT_BOT_TOKEN = process.env.GITHUB_TOKEN

async function main(): Promise<void> {
  // core.info(JSON.stringify(github.context))

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

  const {match, title, body, update} = model
  if (!match) {
    return
  }
  if (typeof body == 'undefined') {
    return
  }

  const octokit = github.getOctokit(botToken)
  const originTitle = title?.split(TRANSLATE_TITLE_DIVING)?.[0]
  // @ts-ignore
  const originComment =
    body.split(TRANSLATE_DIVIDING_LINE).length <= 1
      ? body
      : body.split(TRANSLATE_DIVIDING_LINE)[1].trimEnd()
  const oldAppend = body?.split(TRANSLATE_DIVIDING_LINE)?.[0]
  const translateOrigin = translateText.stringify(originComment, originTitle)
  let newMd5 = Md5.hashStr(translateOrigin)
  const translateOrigin_MD5 =
    ORIGINAL_MD5_PREFIX + newMd5 + ORIGINAL_MD5_POSTFIX
  if (typeof oldAppend !== 'undefined') {
    core.info('比较md5开始：')
    //md5
    const startIndex = oldAppend.indexOf(ORIGINAL_MD5_PREFIX)
    const endIndex = oldAppend?.indexOf(
      ORIGINAL_MD5_POSTFIX,
      startIndex + ORIGINAL_MD5_PREFIX.length
    )
    const originalMd5 = oldAppend.slice(
      startIndex + ORIGINAL_MD5_PREFIX.length,
      endIndex
    )

    core.info('旧的原文md5:' + originalMd5)
    core.info('新的原文md5:' + newMd5)
    if (originalMd5 === newMd5) {
      core.info('原文不变，不需要edit')
      return
    } else {
      core.info('2个md5不一致，需要重新翻译提交！')
    }

    //md5 end
  }

  // translate issue comment body to english
  const translateTmp = await translate(translateOrigin)
  if (!translateTmp || translateTmp == translateOrigin) {
    return core.warning('The translateBody is null or same, ignore return.')
  }

  let [translateTitle, translateComment] = translateText.parse(translateTmp)

  if (shouldAppendContent) {
    const title =
      translateTitle &&
      originTitle !== translateTitle &&
      [originTitle, translateTitle].join(TRANSLATE_TITLE_DIVING)
    const body =
      translateComment &&
      originComment !== translateComment &&
      //       `${originComment}
      // ${TRANSLATE_DIVIDING_LINE}
      // ${translateOrigin_MD5}
      // ---
      // ${translateComment}
      // `
      `
      ${translateComment}
${translateOrigin_MD5}
---
原文：
${TRANSLATE_DIVIDING_LINE}${originComment}`

    await update(octokit, body || undefined, title || undefined)
  } else {
    const needCommitComment =
      translateComment && translateComment !== originComment
    const {
      context: {
        payload: {issue, discussion, pull_request}
      }
    } = github
    translateComment = `
> ${botNote}
----
${
  isModifyTitle === 'false' && needCommitComment
    ? `**Title:** ${translateTitle}`
    : ''
}

${translateComment}`
    if (
      isModifyTitle === 'true' &&
      translateTitle &&
      translateTitle !== originTitle
    ) {
      await update(octokit, undefined, translateTitle)
    }

    if (translateComment && translateComment !== originComment) {
      await createIssueComment({
        pull_number: pull_request?.number,
        discussion_number: discussion?.node_id,
        issue_number: issue?.number,
        body: translateComment,
        octokit
      })
    }
  }

  core.setOutput('complete time', new Date().toTimeString())
}

async function run() {
  try {
    await main()
  } catch (err: any) {
    core.setFailed(err.message)
  }
}

run()
