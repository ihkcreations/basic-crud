'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { format, isToday, isPast, isFuture, differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskForm } from './task-form'
import { 
  Pencil, 
  Trash2, 
  Plus, 
  User, 
  Filter, 
  Search, 
  X, 
  Calendar, 
  AlertCircle,
  ArrowUpDown,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: string | null
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
type SortOption = 'created-desc' | 'created-asc' | 'due-date-asc' | 'due-date-desc' | 'title-asc' | 'title-desc' | 'status'

export function TaskList() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('created-desc')

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
        return 'bg-green-500 dark:bg-green-600'
      case 'in-progress':
        return 'bg-blue-500 dark:bg-blue-600'
      default:
        return 'bg-yellow-500 dark:bg-yellow-600'
    }
  }

  const getDueDateInfo = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return null

    const due = new Date(dueDate)
    const now = new Date()

    if (isPast(due) && !isToday(due)) {
      const daysOverdue = Math.abs(differenceInDays(now, due))
      return {
        label: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
        color: 'bg-red-500 text-white dark:bg-red-600',
        icon: true
      }
    }

    if (isToday(due)) {
      return {
        label: 'Due today',
        color: 'bg-orange-500 text-white dark:bg-orange-600',
        icon: true
      }
    }

    if (isFuture(due)) {
      const daysLeft = differenceInDays(due, now)
      if (daysLeft <= 3) {
        return {
          label: `Due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
          color: 'bg-yellow-500 text-white dark:bg-yellow-600',
          icon: false
        }
      }
      return {
        label: format(due, 'MMM dd, yyyy'),
        color: 'bg-gray-500 text-white dark:bg-gray-600',
        icon: false
      }
    }

    return null
  }

  const isOwner = (task: Task) => {
    return session?.user?.id === task.userId
  }

  // Sort tasks
  const sortTasks = (tasksToSort: Task[]) => {
    const sorted = [...tasksToSort]

    switch (sortOption) {
      case 'created-desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      case 'created-asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      
      case 'due-date-asc':
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
      
      case 'due-date-desc':
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        })
      
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      
      case 'status':
        const statusOrder = { 'pending': 1, 'in-progress': 2, 'completed': 3 }
        return sorted.sort((a, b) => {
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4
          return aOrder - bOrder
        })
      
      default:
        return sorted
    }
  }

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    
    // Filter by search query
    const searchLower = searchQuery.toLowerCase().trim()
    const searchMatch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchLower) ||
      (task.description?.toLowerCase().includes(searchLower) ?? false) ||
      task.user.name.toLowerCase().includes(searchLower)
    
    return statusMatch && searchMatch
  })

  // Apply sorting
  const sortedTasks = sortTasks(filteredTasks)

  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setSortOption('created-desc')
  }

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'all' || sortOption !== 'created-desc'

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'created-desc': return 'Newest First'
      case 'created-asc': return 'Oldest First'
      case 'due-date-asc': return 'Due Date (Earliest)'
      case 'due-date-desc': return 'Due Date (Latest)'
      case 'title-asc': return 'Title (A-Z)'
      case 'title-desc': return 'Title (Z-A)'
      case 'status': return 'Status'
      default: return 'Sort'
    }
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

      {/* Search Bar and Sort */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks by title, description, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {getSortLabel(sortOption)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setSortOption('created-desc')}>
              {sortOption === 'created-desc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'created-desc' && <span className="mr-6" />}
              Newest First
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setSortOption('created-asc')}>
              {sortOption === 'created-asc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'created-asc' && <span className="mr-6" />}
              Oldest First
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setSortOption('due-date-asc')}>
              {sortOption === 'due-date-asc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'due-date-asc' && <span className="mr-6" />}
              Due Date (Earliest)
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setSortOption('due-date-desc')}>
              {sortOption === 'due-date-desc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'due-date-desc' && <span className="mr-6" />}
              Due Date (Latest)
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setSortOption('title-asc')}>
              {sortOption === 'title-asc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'title-asc' && <span className="mr-6" />}
              Title (A-Z)
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => setSortOption('title-desc')}>
              {sortOption === 'title-desc' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'title-desc' && <span className="mr-6" />}
              Title (Z-A)
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => setSortOption('status')}>
              {sortOption === 'status' && <Check className="mr-2 h-4 w-4" />}
              {sortOption !== 'status' && <span className="mr-6" />}
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-card border rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by Status</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-7"
            >
              Clear All Filters
            </Button>
          )}
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
            <Badge variant="secondary" className="ml-1 bg-yellow-100 dark:bg-yellow-900">
              {taskCounts.pending}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="in-progress" aria-label="In progress tasks" className="gap-2">
            In Progress
            <Badge variant="secondary" className="ml-1 bg-blue-100 dark:bg-blue-900">
              {taskCounts['in-progress']}
            </Badge>
          </ToggleGroupItem>
          <ToggleGroupItem value="completed" aria-label="Completed tasks" className="gap-2">
            Completed
            <Badge variant="secondary" className="ml-1 bg-green-100 dark:bg-green-900">
              {taskCounts.completed}
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span>Showing {sortedTasks.length} of {tasks.length} tasks</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={clearSearch}
              />
            </Badge>
          )}
          {filterStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filterStatus}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setFilterStatus('all')}
              />
            </Badge>
          )}
          {sortOption !== 'created-desc' && (
            <Badge variant="secondary" className="gap-1">
              Sort: {getSortLabel(sortOption)}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => setSortOption('created-desc')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTasks.map((task) => {
          const dueDateInfo = getDueDateInfo(task.dueDate, task.status)
          
          return (
            <Card key={task.id} className={!isOwner(task) ? 'opacity-75' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
                <CardDescription>{task.description || 'No description'}</CardDescription>
                
                {/* Due Date Display */}
                {task.dueDate && (
                  <div className="pt-2">
                    <Badge 
                      variant="secondary" 
                      className={dueDateInfo ? dueDateInfo.color : 'bg-gray-100 dark:bg-gray-800'}
                    >
                      {dueDateInfo?.icon && <AlertCircle className="h-3 w-3 mr-1" />}
                      {!dueDateInfo?.icon && <Calendar className="h-3 w-3 mr-1" />}
                      {dueDateInfo ? dueDateInfo.label : format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </Badge>
                  </div>
                )}
                
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
          )
        })}
      </div>

      {sortedTasks.length === 0 && tasks.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No tasks found</p>
          <p className="text-sm">
            {searchQuery && `No results for "${searchQuery}"`}
            {searchQuery && filterStatus !== 'all' && ' with '}
            {filterStatus !== 'all' && `status "${filterStatus}"`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="mt-4"
          >
            Clear Filters
          </Button>
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