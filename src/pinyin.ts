import type { Tables } from 'koishi'

const pinyinSeparator = /[- ]/

type Pinyin = (sentence: string) => { origin: string, pinyin: string }[]

export function maskAnswer(hanting: Tables['hanting'], pinyin: Pinyin): void {
  const replaceMap = new Map()
  const words = hanting.word.split('/')
  let index = 0
  for (const pinyin of hanting.pinyin.split(pinyinSeparator)) {
    for (const word of words)
      replaceMap.set(word[index], pinyin)
    index++
  }

  const pinyinSet = new Set(hanting.pinyin.toLowerCase().split(pinyinSeparator))
  const maskText = (sentence: string) => {
    for (const [origin, pinyin] of replaceMap)
      sentence = sentence.replaceAll(origin, pinyin)
    return pinyin(sentence)
      .map(({ origin, pinyin }) => hanting.word.includes(origin)
        || pinyinSet.has(pinyin) ? ` ${pinyin} ` : origin)
      .join('')
      .replaceAll(/\s*(\p{P})\s*/gu, '$1')
      .replaceAll(/\s+/g, ' ')
  }

  hanting.definition = maskText(hanting.definition)
  hanting.example && (hanting.example = maskText(hanting.example))
}
