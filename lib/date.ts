/**
 * 日付を日本語形式でフォーマットします
 * @param date フォーマットする日付（Dateオブジェクトまたは文字列）
 * @returns `yyyy年MM月dd日(E)`形式の文字列（例: `2024年01月15日(月)`）
 */
export function formatDateWithWeekday(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[d.getDay()]
  return `${year}年${month}月${day}日(${weekday})`
}
