import type { Tables } from 'koishi'
import type { Pinyin } from 'koishi-plugin-pinyin'

const pinyinSeparator = /[- ]/

export async function maskAnswer(hanting: Tables['hanting'], asyncPinyin: Pinyin['asyncPinyin']): Promise<void> {
  const replaceMap = new Map()
  const words = hanting.word.split('/')
  let index = 0
  for (const pinyin of hanting.pinyin.split(pinyinSeparator)) {
    for (const word of words)
      replaceMap.set(word[index], pinyin)
    index++
  }

  const pinyinSet = new Set(hanting.pinyin.toLowerCase().split(pinyinSeparator))
  const maskText = async (sentence: string) => {
    for (const [origin, pinyin] of replaceMap)
      sentence = sentence.replaceAll(origin, ` ${pinyin} `)
    return (await asyncPinyin(sentence, { style: 1 }) as string[])
      .map((pinyin, index) => hanting.word.includes(sentence[index])
        || pinyinSet.has(pinyin) ? ` ${pinyin} ` : sentence[index])
      .join('')
      .replaceAll(/\s*(\p{P})\s*/gu, '$1')
      .replaceAll(/\s+/g, ' ')
  }

  const promises = [maskText(hanting.definition).then(masked => hanting.definition = masked)]
  if (hanting.example)
    promises.push(maskText(hanting.example).then(masked => hanting.example = masked))
  await Promise.all(promises)
}
