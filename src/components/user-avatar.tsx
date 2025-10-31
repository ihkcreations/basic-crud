'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'

interface UserAvatarProps {
  name?: string | null
  avatar?: string | null
  email?: string | null
  className?: string
}

export function UserAvatar({ name, avatar, email, className }: UserAvatarProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return '?'
    
    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={avatar || undefined} alt={name || 'User'} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}