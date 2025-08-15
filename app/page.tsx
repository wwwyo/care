import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex max-w-5xl flex-col items-center gap-12">
        <h1 className="text-5xl font-bold text-center">ミタスケア</h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl">
          厚生労働省標準様式のサービス等利用計画書を基に、
          福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現
        </p>

        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2">支援者の方</h2>
            <p className="text-gray-600 mb-4">サービス等利用計画書の作成と施設検索を効率化</p>
            <Link
              href="/supporter/login"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              支援者ログイン
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2">施設スタッフの方</h2>
            <p className="text-gray-600 mb-4">空き状況の更新と照会への対応を簡単に</p>
            <Link
              href="/facility/login"
              className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              施設ログイン
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2">利用者の方</h2>
            <p className="text-gray-600 mb-4">ご自身の計画書の確認と同意手続き</p>
            <Link
              href="/login"
              className="inline-block rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              利用者ログイン
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
