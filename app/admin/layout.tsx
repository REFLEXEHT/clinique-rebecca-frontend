'use client'
// app/admin/layout.tsx — Layout admin avec sidebar
import { useEffect, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { LOGO_SRC } from '@/lib/images'

const NAV_GROUPS = [
  { label: 'Tableau de bord', items: [
    { href: '/admin/dashboard', icon: 'fa-grid-2', label: 'Vue générale' },
    { href: '/admin/rendez-vous', icon: 'fa-calendar-check', label: 'Rendez-vous' },
  ]},
  { label: 'Comptabilité', items: [
    { href: '/admin/comptabilite', icon: 'fa-chart-line', label: 'Compte de résultat' },
    { href: '/admin/caisse', icon: 'fa-cash-register', label: 'Caisse & Recettes' },
    { href: '/admin/depenses', icon: 'fa-file-invoice', label: 'Dépenses' },
  ]},
  { label: 'Gestion', items: [
    { href: '/admin/services', icon: 'fa-grid-2', label: 'Services' },
    { href: '/admin/specialistes', icon: 'fa-user-doctor', label: 'Spécialistes' },
    { href: '/admin/horaires', icon: 'fa-clock', label: 'Horaires' },
    { href: '/admin/tarifs', icon: 'fa-tag', label: 'Tarifs' },
    { href: '/admin/labo', icon: 'fa-flask-vial', label: 'Laboratoire' },
    { href: '/admin/stocks', icon: 'fa-boxes-stacked', label: 'Stocks pharmacie' },
  ]},
  { label: 'Rapports', items: [
    { href: '/admin/statistiques', icon: 'fa-chart-bar', label: 'Statistiques' },
    { href: '/admin/patients', icon: 'fa-users', label: 'Patients' },
    { href: '/patients/nouveau', icon: 'fa-user-plus', label: 'Nouveau patient' },
    { href: '/admin/utilisateurs', icon: 'fa-user-shield', label: 'Utilisateurs' },
  ]},
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login')
    }
  }, [isAuthenticated, user, loading, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#0f172a] flex-shrink-0 fixed top-0 bottom-0 left-0
        flex flex-col overflow-y-auto z-50">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Logo" className="h-9 object-contain"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </Link>
          <div className="mt-2 px-1">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Administration
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              <div className="asi-label">{group.label}</div>
              {group.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={`asi mb-0.5 ${active ? 'active' : ''}`}>
                    <i className={`fa-solid ${item.icon}`} />
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
            <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center
              text-white/80 text-xs font-extrabold flex-shrink-0">
              {user?.nom?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-[12px] font-bold leading-tight truncate">
                {user?.nom || 'Admin'}
              </div>
              <div className="text-white/40 text-[10px]">Administrateur</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 py-1.5
              rounded-lg bg-white/8 text-white/60 text-[11px] font-semibold
              hover:bg-white/14 transition-all no-underline">
              <i className="fa-solid fa-arrow-left text-xs" /> Site
            </Link>
            <button onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5
              rounded-lg bg-red-900/30 text-red-400 text-[11px] font-semibold
              hover:bg-red-900/50 transition-all border-none cursor-pointer">
              <i className="fa-solid fa-sign-out-alt text-xs" /> Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[220px] bg-slate-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
