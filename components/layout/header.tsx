'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession } from '@/hooks/use-session'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import LogoutButton from '../auth/logout-button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Usuários', href: '/users' },
]

export function Header() {
  const pathname = usePathname()
  const { user, userData, loading } = useSession()

  if (pathname === '/login') {
    return null
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
                La Lunna
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'border-teal-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {loading ? (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : user ? (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {userData?.nome || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {userData?.nivel || 'Usuário'}
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
