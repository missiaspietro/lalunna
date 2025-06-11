'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function LogoutButton() {
  const { signOut } = useAuth()

  return (
    <Button
      variant="ghost"
      onClick={signOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  )
}
