import type { Tables } from 'koishi'

const pinyinSeparator = /[- ]/

type Pinyin = (sentence: string) => { origin: string, pinyin: string }[]

export function maskPinyin(hanting: Tables['hanting'], pinyin: Pinyin): void {
  const pinyinSet = new Set(hanting.pinyin.toLowerCase().split(pinyinSeparator))
  const maskText = (sentence: string) => {
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
