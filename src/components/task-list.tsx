'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskForm } from './task-form'
import { Pencil, Trash2, Plus, User } from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

export function TaskList() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      
      if (response.ok) {
        toast.success('Task deleted successfully!')
        fetchTasks()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingTask(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in-progress':
        return 'bg-blue-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const isOwner = (task: Task) => {
    return session?.user?.id === task.userId
  }

  if (isPending || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id} className={!isOwner(task) ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <CardDescription>{task.description || 'No description'}</CardDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <User className="h-3 w-3" />
                <span>{task.user.name}</span>
                {isOwner(task) && (
                  <Badge variant="outline" className="ml-2">You</Badge>
                )}
              </div>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(task)}
                disabled={!isOwner(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(task.id)}
                disabled={!isOwner(task)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No tasks yet. Create your first task to get started!
        </div>
      )}

      <TaskForm
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        task={editingTask}
        onSuccess={fetchTasks}
      />
    </div>
  )
}