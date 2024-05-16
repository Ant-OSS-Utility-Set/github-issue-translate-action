import * as core from '@actions/core'
import GoogleTranslate from '@tomsun28/google-translate-api'

export async function translate(text: string): Promise<string | undefined> {
  try {
    const chunks = splitText(text, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks = [];
    for (const chunk of chunks) {
      const resp = await  GoogleTranslate(text, {to: 'en'});
      translatedChunks.push(resp.text);
    }
    return translatedChunks.join('')
  } catch (err: any) {
    core.error(err)
    core.setFailed(err.message)
  }
}

function splitText(text: string, chunkSize: number) {
  const chunks = [];
  let currentChunk = '';
  for (const char of text) {
    currentChunk += char;
    if (currentChunk.length >= chunkSize) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

const MAGIC_JOIN_STRING = '@@===='
export const translateText = {
  parse(text?: string) {
    if (!text) {
      return [ undefined, undefined ]
    }

    const translateBody: string[] = text.split(MAGIC_JOIN_STRING)
    return [ translateBody?.[0]?.trim(), translateBody[1].trim() ]
  },
  stringify(body?: string, title?: string) {
    // let needCommitComment = body && body !== 'null' && !isEnglish(body)
    // let needCommitTitle = title && title !== 'null' && !isEnglish(title)
    //
    // let translateOrigin = null
    //
    // if (!needCommitComment) {
    //   core.info('Detect the issue comment body is english already, ignore.')
    // }
    // if (!needCommitTitle) {
    //   core.info('Detect the issue title body is english already, ignore.')
    // }
    // if (!needCommitTitle && !needCommitComment) {
    //   core.info('Detect the issue do not need translated, return.')
    //   return translateOrigin
    // }

    return [ body || 'null', title ].join(MAGIC_JOIN_STRING)
  }
}