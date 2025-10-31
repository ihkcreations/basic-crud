import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// BULK DELETE tasks
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { taskIds } = body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Task IDs are required' },
        { status: 400 }
      )
    }

    // Verify all tasks belong to the user
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        userId: session.user.id
      }
    })

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'You can only delete your own tasks' },
        { status: 403 }
      )
    }

    // Delete tasks
    const result = await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
        userId: session.user.id
      }
    })

    return NextResponse.json({ 
      message: 'Tasks deleted successfully',
      count: result.count 
    })
  } catch (error: any) {
    console.error('DELETE /api/tasks/bulk error:', error)
    return NextResponse.json(
      { error: 'Failed to delete tasks' },
      { status: 500 }
    )
  }
}

// BULK UPDATE tasks
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { taskIds, updates } = body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Task IDs are required' },
        { status: 400 }
      )
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Updates are required' },
        { status: 400 }
      )
    }

    // Verify all tasks belong to the user
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
        userId: session.user.id
      }
    })

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'You can only update your own tasks' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (updates.status) updateData.status = updates.status
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null
    }
    
    // Handle tag additions
    if (updates.addTagIds && Array.isArray(updates.addTagIds)) {
      // For each task, add the new tags to existing ones
      await Promise.all(
        taskIds.map(async (taskId) => {
          const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { tagIds: true }
          })
          
          if (task) {
            const existingTagIds = task.tagIds || []
            const newTagIds = updates.addTagIds.filter(
              (tagId: string) => !existingTagIds.includes(tagId)
            )
            const combinedTagIds = [...existingTagIds, ...newTagIds]
            
            await prisma.task.update({
              where: { id: taskId },
              data: { tagIds: combinedTagIds }
            })
          }
        })
      )
      
      return NextResponse.json({ 
        message: 'Tasks updated successfully',
        count: taskIds.length 
      })
    }

    // Update tasks with other fields
    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        userId: session.user.id
      },
      data: updateData
    })

    return NextResponse.json({ 
      message: 'Tasks updated successfully',
      count: result.count 
    })
  } catch (error: any) {
    console.error('PUT /api/tasks/bulk error:', error)
    return NextResponse.json(
      { error: 'Failed to update tasks' },
      { status: 500 }
    )
  }
}