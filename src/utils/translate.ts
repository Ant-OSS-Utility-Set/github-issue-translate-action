import * as core from '@actions/core'
import BingTrans  from 'bing-translate-api'
import {qWentranslat} from './qwen'
import GoogleTrans  from "@tomsun28/google-translate-api"




export async function translate(text: string): Promise<string | undefined> {
  try {
    const chunks = splitText(text, 1000);
    core.info("分为几个部分翻译：" +chunks.length);
    const translatedChunks: (string | undefined)[] = [];
    for (const chunk of chunks) {
      let result = await replaceTrans(chunk, "en");
      translatedChunks.push(result);
    }
      return translatedChunks.join('')
  } catch (err: any) {
    core.error(err)
    core.setFailed(err.message)
  }
}

// replaceTrans
async function replaceTrans(body:string,to:string) {
  const imgRegex = /<img[^>]+>/g;
  const matches = body.match(imgRegex) || [];
// 替换匹配到的内容
  let replacedString = body;
  matches.forEach((match, index) => {
    console.log("开始替换："+match)
    replacedString = replacedString.replace(match, `{$${index}}`);
  });
  let result: string | undefined

  let flag = false;
  await BingTrans.translate(replacedString, "zh-Hans", "en").then(res => {
     result = res?.translation;
    core.info("bing翻译成功：" + result);
    flag = true
  }).catch(err => {
    core.error(err);
  });

  if(!flag){
    await GoogleTrans(replacedString, {to: 'en'}).then((res: { text: string | undefined; }) => {
      result = res.text
      core.info("google翻译成功：" + result);
      flag = true
    }).catch((err: any) => {
      console.error(err);
    });
  }

  if(!flag){
    let qwenres =  await qWentranslat(replacedString)
    result = qwenres ?? undefined
    core.info("qwen翻译成功：" );
  }


  // 把替换后的字符串变回原来的样子
  matches.forEach((match, index) => {
    console.log("替换回来："+match)
    result = result?.replace(`{$${index}}`, match);
  });
  return result;
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