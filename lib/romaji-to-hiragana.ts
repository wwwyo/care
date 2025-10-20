const DIGRAPHS: Record<string, string> = {
  kya: 'きゃ',
  kyu: 'きゅ',
  kyo: 'きょ',
  gya: 'ぎゃ',
  gyu: 'ぎゅ',
  gyo: 'ぎょ',
  sha: 'しゃ',
  shu: 'しゅ',
  sho: 'しょ',
  sya: 'しゃ',
  syu: 'しゅ',
  syo: 'しょ',
  ja: 'じゃ',
  ju: 'じゅ',
  jo: 'じょ',
  jya: 'じゃ',
  jyu: 'じゅ',
  jyo: 'じょ',
  cha: 'ちゃ',
  chu: 'ちゅ',
  cho: 'ちょ',
  tya: 'ちゃ',
  tyu: 'ちゅ',
  tyo: 'ちょ',
  nya: 'にゃ',
  nyu: 'にゅ',
  nyo: 'にょ',
  hya: 'ひゃ',
  hyu: 'ひゅ',
  hyo: 'ひょ',
  bya: 'びゃ',
  byu: 'びゅ',
  byo: 'びょ',
  pya: 'ぴゃ',
  pyu: 'ぴゅ',
  pyo: 'ぴょ',
  mya: 'みゃ',
  myu: 'みゅ',
  myo: 'みょ',
  rya: 'りゃ',
  ryu: 'りゅ',
  ryo: 'りょ',
  fa: 'ふぁ',
  fi: 'ふぃ',
  fu: 'ふ',
  fe: 'ふぇ',
  fo: 'ふぉ',
  va: 'ゔぁ',
  vi: 'ゔぃ',
  vu: 'ゔ',
  ve: 'ゔぇ',
  vo: 'ゔぉ',
}

const BASIC_SYLLABLES: Record<string, string> = {
  a: 'あ',
  i: 'い',
  u: 'う',
  e: 'え',
  o: 'お',
  ka: 'か',
  ki: 'き',
  ku: 'く',
  ke: 'け',
  ko: 'こ',
  ga: 'が',
  gi: 'ぎ',
  gu: 'ぐ',
  ge: 'げ',
  go: 'ご',
  sa: 'さ',
  shi: 'し',
  si: 'し',
  su: 'す',
  se: 'せ',
  so: 'そ',
  za: 'ざ',
  ji: 'じ',
  zi: 'じ',
  zu: 'ず',
  ze: 'ぜ',
  zo: 'ぞ',
  ta: 'た',
  chi: 'ち',
  ti: 'ち',
  tsu: 'つ',
  tu: 'つ',
  te: 'て',
  to: 'と',
  da: 'だ',
  di: 'ぢ',
  du: 'づ',
  de: 'で',
  do: 'ど',
  na: 'な',
  ni: 'に',
  nu: 'ぬ',
  ne: 'ね',
  no: 'の',
  ha: 'は',
  hi: 'ひ',
  fu: 'ふ',
  he: 'へ',
  ho: 'ほ',
  ba: 'ば',
  bi: 'び',
  bu: 'ぶ',
  be: 'べ',
  bo: 'ぼ',
  pa: 'ぱ',
  pi: 'ぴ',
  pu: 'ぷ',
  pe: 'ぺ',
  po: 'ぽ',
  ma: 'ま',
  mi: 'み',
  mu: 'む',
  me: 'め',
  mo: 'も',
  ya: 'や',
  yu: 'ゆ',
  yo: 'よ',
  ra: 'ら',
  ri: 'り',
  ru: 'る',
  re: 'れ',
  ro: 'ろ',
  wa: 'わ',
  wi: 'うぃ',
  we: 'うぇ',
  wo: 'を',
  n: 'ん',
}

function isConsonant(char: string): boolean {
  return /[bcdfghjklmnpqrstvwxyz]/.test(char)
}

/**
 * ローマ字を簡易的にひらがなへ変換する。
 * 名前入力での利用を想定し、完全なIME互換ではないものの、
 * 一般的な拗音・促音・撥音に対応する。
 */
export function romajiToHiragana(input: string): string {
  const lower = input.toLowerCase()
  let result = ''
  let i = 0

  while (i < lower.length) {
    const remaining = lower.slice(i)

    if (remaining.startsWith('-')) {
      result += 'ー'
      i += 1
      continue
    }

    if (remaining.startsWith(' ')) {
      result += ' '
      i += 1
      continue
    }

    if (remaining.startsWith("'")) {
      i += 1
      continue
    }

    // っの処理（促音）
    const first = remaining.charAt(0)
    const second = remaining.charAt(1)

    if (second && first === second && isConsonant(first) && first !== 'n') {
      result += 'っ'
      i += 1
      continue
    }

    // 拗音など長いシラブルの判定（三文字）
    const tri = remaining.slice(0, 3)
    if (DIGRAPHS[tri]) {
      result += DIGRAPHS[tri]
      i += 3
      continue
    }

    // 二文字シラブル
    const bi = remaining.slice(0, 2)
    if (DIGRAPHS[bi]) {
      result += DIGRAPHS[bi]
      i += 2
      continue
    }

    if (BASIC_SYLLABLES[tri]) {
      result += BASIC_SYLLABLES[tri]
      i += 3
      continue
    }

    if (BASIC_SYLLABLES[bi]) {
      result += BASIC_SYLLABLES[bi]
      i += 2
      continue
    }

    const single = first

    if (single === 'n') {
      const next = second
      if (!next || !/[aiueoyn]/.test(next)) {
        result += 'ん'
        i += 1
        continue
      }
    }

    if (BASIC_SYLLABLES[single]) {
      result += BASIC_SYLLABLES[single]
      i += 1
      continue
    }

    result += input[i]
    i += 1
  }

  return result
}
