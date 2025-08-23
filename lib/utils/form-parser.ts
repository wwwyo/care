/**
 * FormDataから配列形式のデータをパースする
 * services[0].serviceCategory のような形式を配列に変換
 */
export function parseArrayFromFormData<T extends Record<string, unknown>>(
  formData: FormData,
  fieldName: string,
): T[] {
  const result: T[] = []
  const pattern = new RegExp(`^${fieldName}\\[(\\d+)\\]\\.(.+)$`)

  // FormDataのすべてのエントリーを走査
  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern)
    if (match) {
      const index = parseInt(match[1]!, 10)
      const property = match[2]!

      // 配列の該当インデックスにオブジェクトを作成
      if (!result[index]) {
        result[index] = {} as T
      }
      // プロパティを設定
      ;(result[index] as Record<string, unknown>)[property] = value
    }
  }

  // undefined要素を除外して返す
  return result.filter((item) => item !== undefined)
}
