import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  name: string
  color: string
  onRemove?: () => void
  className?: string
  size?: 'sm' | 'md'
}

const colorClasses: Record<string, string> = {
  gray: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600',
  red: 'bg-red-500 hover:bg-red-600 dark:bg-red-600',
  orange: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600',
  green: 'bg-green-500 hover:bg-green-600 dark:bg-green-600',
  blue: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600',
  purple: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600',
  pink: 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600',
}

export function TagBadge({ name, color, onRemove, className, size = 'sm' }: TagBadgeProps) {
  return (
    <Badge 
      className={cn(
        'text-white',
        colorClasses[color] || colorClasses.gray,
        onRemove && 'pr-1',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className
      )}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}