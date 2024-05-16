import * as core from '@actions/core'
// import GoogleTranslate from '@tomsun28/google-translate-api'
import BingTrans  from 'bing-translate-api'

export async function translate(text: string): Promise<string | undefined> {
  try {
    const chunks = splitText(text, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks: (string | undefined)[] = [];
    for (const chunk of chunks) {
      core.info("翻译块："+chunk)
      await BingTrans.translate(chunk, "zh", "en").then(res => {
        const result = res?.translation;
        core.info("翻译成功：" + result);
        translatedChunks.push(result);

      }).catch(err => {
        core.error(err);
      });


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
      return [ '', '']
    }

    const translateBody: string[] = text.split(MAGIC_JOIN_STRING)
    if(translateBody.length<2){
      core.error("翻译后的文本没有分隔符")
    }
    return [ translateBody?.[0], translateBody?.[1] ]
  },
  stringify(body?: string, title?: string) {
    return [ title,body ].join(MAGIC_JOIN_STRING)
  }
}