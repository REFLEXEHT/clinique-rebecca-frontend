'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'

const NAV = [
  { group: 'Tableau de bord', items: [
    { href: '/admin/dashboard', icon: 'fa-grid-2', label: 'Vue générale' },
    { href: '/admin/rendez-vous', icon: 'fa-calendar-check', label: 'Rendez-vous' },
  ]},
  { group: 'Comptabilité', items: [
    { href: '/admin/comptabilite', icon: 'fa-chart-line', label: 'Compte de résultat' },
    { href: '/admin/caisse', icon: 'fa-cash-register', label: 'Caisse & Recettes' },
    { href: '/admin/depenses', icon: 'fa-file-invoice', label: 'Dépenses' },
  ]},
  { group: 'Gestion', items: [
    { href: '/admin/services', icon: 'fa-grid-2', label: 'Services' },
    { href: '/admin/specialistes', icon: 'fa-user-doctor', label: 'Spécialistes' },
    { href: '/admin/horaires', icon: 'fa-clock', label: 'Horaires' },
  ]},
  { group: 'Rapports', items: [
    { href: '/admin/statistiques', icon: 'fa-chart-bar', label: 'Statistiques' },
    { href: '/admin/patients', icon: 'fa-users', label: 'Patients' },
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, init } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login')
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1a2a4a] flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 brightness-0 invert opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </Link>
          <div className="mt-2 px-1">
            <div className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Administration</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.group} className="mb-4">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-1.5">
                {group.group}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={`asi mb-0.5 ${active ? 'active' : ''}`}>
                    <i className={`fa-solid ${item.icon} w-4 text-center text-[12px]`} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 bg-[#1a4fc4]/40 rounded-lg flex items-center justify-center text-white/70 text-xs font-bold">
              {user?.nom?.[0] || 'A'}
            </div>
            <div>
              <div className="text-white text-[12px] font-bold leading-tight">{user?.nom || 'Admin'}</div>
              <div className="text-white/40 text-[10px]">{user?.role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
              bg-white/8 text-white/60 text-[11px] font-semibold hover:bg-white/15 transition-all">
              <i className="fa-solid fa-arrow-left text-xs" /> Site
            </Link>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-1.5 py-1.5
              rounded-lg bg-red-900/30 text-red-400 text-[11px] font-semibold hover:bg-red-900/50 transition-all border-none cursor-pointer">
              <i className="fa-solid fa-sign-out-alt text-xs" /> Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
