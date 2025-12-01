/**
 * 生年月日から現在の年齢を正確に計算する
 * @param birthDate 生年月日
 * @param referenceDate 基準日（省略時は現在日時）
 * @returns 年齢
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  // 年の差を計算
  let age = referenceDate.getFullYear() - birthDate.getFullYear()

  // 月を比較
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()

  // 誕生月がまだ来ていない、または誕生月だが誕生日がまだ来ていない場合
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
