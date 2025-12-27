import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all work orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const workCenterId = searchParams.get('workCenterId')

    const where: any = {}
    if (requestId) where.requestId = requestId
    if (workCenterId) where.workCenterId = workCenterId

    const workOrders = await prisma.workOrder.findMany({
      where,
      include: {
        request: {
          include: {
            equipment: true
          }
        },
        workCenter: true,
        activities: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(workOrders)
  } catch (error) {
    console.error('Error fetching work orders:', error)
    return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 })
  }
}

// POST create new work order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, workCenterId, technicianId, priority, estimatedHours, notes } = body

    // Validate required fields
    if (!requestId || !workCenterId) {
      return NextResponse.json(
        { error: 'requestId and workCenterId are required' },
        { status: 400 }
      )
    }

    // Create work order
    const workOrder = await prisma.workOrder.create({
      data: {
        requestId,
        workCenterId,
        technicianId,
        priority: priority || 'MEDIUM',
        estimatedHours,
        notes
      },
      include: {
        request: {
          include: {
            equipment: true
          }
        },
        workCenter: true
      }
    })

    // Log activity for the request
    await prisma.teamActivity.create({
      data: {
        requestId,
        teamId: workCenterId,
        action: `Work order created for ${workCenterId}`
      }
    })

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating work order:', error)
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 })
  }
}
