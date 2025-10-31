'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TaskForm } from './task-form'
import { Pencil, Trash2, Plus, User, Filter } from 'lucide-react'
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

type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed'

export function TaskList() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

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

  // Filter tasks based on selected status
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true
    return task.status === filterStatus
  })

  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  if (isPending || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-white border rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Status</span>
        </div>
        
        <ToggleGroup
          type="single"
          value={filterStatus}
          onValueChange={(value) => value && setFilterStatus(value as FilterStatus)}
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem value="all" aria-label="All tasks" className="gap-2">
            All
            <Badge variant="secondary" className="ml-1">
              {taskCounts.all}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="pending" aria-label="Pending tasks" className="gap-2">
            Pending
            <Badge variant="secondary" className="ml-1 bg-yellow-100">
              {taskCounts.pending}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="in-progress" aria-label="In progress tasks" className="gap-2">
            In Progress
            <Badge variant="secondary" className="ml-1 bg-blue-100">
              {taskCounts['in-progress']}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="completed" aria-label="Completed tasks" className="gap-2">
            Completed
            <Badge variant="secondary" className="ml-1 bg-green-100">
              {taskCounts.completed}
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
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

      {filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No tasks found with status: <span className="font-semibold">{filterStatus}</span>
        </div>
      )}

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