import Image from 'next/image'
import Link from 'next/link'
import { getUserRealm } from '@/features/auth/helpers'

export async function Header() {
  const realm = await getUserRealm()

  const href = realm === 'supporter' ? '/supporters/clients' : realm === 'client' ? '/clients/dashboard' : '/'

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href={href} className="hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="CareHub" width={160} height={40} priority />
        </Link>
      </div>
    </header>
  )
}
