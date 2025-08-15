import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex max-w-5xl flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">MitasCare</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            厚生労働省標準様式のサービス等利用計画書を基に、
            福祉施設の空き状況と連動した施設候補検索と同意取得をワンストップで実現
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 w-full">
          <Card>
            <CardHeader>
              <CardTitle>支援者の方</CardTitle>
              <CardDescription>サービス等利用計画書の作成と施設検索を効率化</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/supporter/login">支援者ログイン</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>施設スタッフの方</CardTitle>
              <CardDescription>空き状況の更新と照会への対応を簡単に</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/facility/login">施設ログイン</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>利用者の方</CardTitle>
              <CardDescription>ご自身の計画書の確認と同意手続き</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">利用者ログイン</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
