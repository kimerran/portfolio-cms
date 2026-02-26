import Link from 'next/link'
import { LayoutDashboard, FolderOpen, MessageSquare } from 'lucide-react'
import { LogoutButton } from './LogoutButton'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/contacts', label: 'Contacts', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-brand-border bg-white">
        <div className="border-b border-brand-border px-6 py-5">
          <Link href="/admin" className="text-lg font-bold text-brand hover:text-brand-accent">
            Admin CMS
          </Link>
        </div>

        <nav className="flex flex-1 flex-col p-4" aria-label="Admin navigation">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-accent transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-brand-border p-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
