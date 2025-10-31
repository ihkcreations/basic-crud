import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tasks', 
        message: error?.message,
        stack: error?.stack 
      },
      { status: 500 }
    )
  }
}

// CREATE new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received data:', body)
    
    const { title, description, status } = body

    if (!title) {
      console.log('❌ Title is missing')
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Creating task with Prisma...')
    
    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: status || 'pending'
      }
    })

    console.log('✅ Task created successfully:', task)
    return NextResponse.json(task, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ POST /api/tasks error:', error)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Error name:', error?.name)
    
    return NextResponse.json(
      { 
        error: 'Failed to create task', 
        message: error?.message,
        name: error?.name,
        details: JSON.stringify(error, null, 2)
      },
      { status: 500 }
    )
  }
}