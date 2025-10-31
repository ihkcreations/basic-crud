'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Trash2, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Tags,
  X,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  color: string
}

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => Promise<void>
  onBulkStatusChange: (status: string) => Promise<void>
  onBulkTagsAdd: (tagIds: string[]) => Promise<void>
  availableTags: Tag[]
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkTagsAdd,
  availableTags,
}: BulkActionsToolbarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onBulkDelete()
      setShowDeleteDialog(false)
      toast.success(`${selectedCount} task(s) deleted`)
    } catch (error) {
      toast.error('Failed to delete tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    setLoading(true)
    try {
      await onBulkStatusChange(status)
      toast.success(`${selectedCount} task(s) updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (tagId: string) => {
    setLoading(true)
    try {
      await onBulkTagsAdd([tagId])
      const tag = availableTags.find(t => t.id === tagId)
      toast.success(`Tag "${tag?.name}" added to ${selectedCount} task(s)`)
    } catch (error) {
      toast.error('Failed to add tag')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-lg rounded-lg p-4 mb-6 animate-in slide-in-from-top-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary-foreground text-primary">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Change Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={loading}
                  className="gap-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                  <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Tags Dropdown */}
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={loading}
                    className="gap-2"
                  >
                    <Tags className="h-4 w-4" />
                    Add Tag
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                  <DropdownMenuLabel>Add Tag to Selected</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableTags.map((tag) => (
                    <DropdownMenuItem 
                      key={tag.id} 
                      onClick={() => handleAddTag(tag.id)}
                    >
                      <div className={`mr-2 h-3 w-3 rounded-full bg-${tag.color}-500`} />
                      {tag.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} task(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}