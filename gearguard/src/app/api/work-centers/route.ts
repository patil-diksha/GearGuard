import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all work centers
export async function GET() {
  try {
    const workCenters = await prisma.workCenter.findMany({
      include: {
        parts: true,
        workOrders: true,
        activities: true,
        _count: {
          select: {
            parts: true,
            workOrders: true,
            activities: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(workCenters)
  } catch (error) {
    console.error('Error fetching work centers:', error)
    return NextResponse.json({ error: 'Failed to fetch work centers' }, { status: 500 })
  }
}

// POST create new work center
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, department } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    // Check if work center already exists
    const existingWorkCenter = await prisma.workCenter.findUnique({
      where: { name }
    })

    if (existingWorkCenter) {
      return NextResponse.json(
        { error: 'Work center with this name already exists' },
        { status: 409 }
      )
    }

    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        location,
        department
      }
    })

    return NextResponse.json(workCenter, { status: 201 })
  } catch (error) {
    console.error('Error creating work center:', error)
    return NextResponse.json({ error: 'Failed to create work center' }, { status: 500 })
  }
}
