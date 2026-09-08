// app/admin/layout.tsx
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { obtenirSession } from '@/lib/adminSession'
import LienSidebar from '@/components/admin/LienSidebar'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/scoring', label: 'Configuration scoring' },
  { href: '/admin/candidatures', label: 'Candidatures reçues' },
  { href: '/admin/candidatures-acceptees', label: 'Candidatures acceptées' },
  { href: '/admin/comptes', label: 'Comptes admin' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const session = obtenirSession(token)

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F1F3F6' }}>
      <aside className="w-64 shrink-0 flex flex-col text-white" style={{ backgroundColor: 'var(--cfp-navy)' }}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Image src="/logo-mbs.png" alt="CFP-MBS" width={40} height={40} className="rounded-full" />
          <div>
            <p className="text-sm font-semibold">CFP-MBS</p>
            <p className="text-xs text-white/60">Espace admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <LienSidebar key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 px-3 mb-2">{session.email}</p>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}