import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('GET /api/tasks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task', message: error?.message },
      { status: 500 }
    )
  }
}

// UPDATE task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status } = body

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status
      }
    })

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('PUT /api/tasks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update task', message: error?.message },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task', message: error?.message },
      { status: 500 }
    )
  }
}