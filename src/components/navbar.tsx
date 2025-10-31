'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { LogOut, UserCircle, Tags } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'
import { UserAvatar } from './user-avatar'
import { ProfileDialog } from './profile-dialog'
import { TagManager } from './tag-manager'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserProfile {
  name: string
  email: string
  avatar: string | null
  bio: string | null
}

export function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [tagManagerOpen, setTagManagerOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!session) return null

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserAvatar 
              name={profile?.name || session.user?.name} 
              avatar={profile?.avatar}
              email={session.user?.email}
              className="h-9 w-9"
            />
            <div className="hidden sm:block">
              <p className="font-medium text-sm">{profile?.name || session.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session.user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTagManagerOpen(true)}>
                  <Tags className="mr-2 h-4 w-4" />
                  Manage Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <ProfileDialog 
        open={profileOpen} 
        onOpenChange={setProfileOpen}
        onProfileUpdate={fetchProfile}
      />

      <TagManager
        open={tagManagerOpen}
        onOpenChange={setTagManagerOpen}
        onTagsUpdate={() => {
          // Trigger refresh if needed
        }}
      />
    </>
  )
}