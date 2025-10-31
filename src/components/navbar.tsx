'use client'

import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) return null

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <span className="font-medium">{session.user?.name}</span>
          <span className="text-sm text-muted-foreground">
            ({session.user?.email})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}