import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const workCenterId = searchParams.get('workCenterId')
    const status = searchParams.get('status')

    const where: any = {}
    if (requestId) where.requestId = requestId
    if (workCenterId) where.workCenterId = workCenterId
    if (status) where.status = status

    const activities = await prisma.activity.findMany({
      where,
      include: {
        request: {
          include: {
            equipment: true
          }
        },
        workOrder: {
          include: {
            workCenter: true
          }
        },
        workCenter: true,
        parts: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST create new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      requestId, 
      workOrderId, 
      name, 
      description, 
      workCenterId, 
      technician, 
      startDate, 
      endDate, 
      status, 
      partsUsed, 
      cost, 
      oeeAchieved 
    } = body

    // Validate required fields
    if (!requestId || !name) {
      return NextResponse.json(
        { error: 'requestId and name are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        requestId,
        workOrderId,
        name,
        description,
        workCenterId,
        technician,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'PENDING',
        partsUsed: partsUsed || [],
        cost,
        oeeAchieved
      },
      include: {
        request: {
          include: {
            equipment: true
          }
        },
        workOrder: {
          include: {
            workCenter: true
          }
        },
        workCenter: true
      }
    })

    // Log activity for the request
    await prisma.teamActivity.create({
      data: {
        requestId,
        teamId: workCenterId || activity.request.autoFilledTeamId,
        action: `Activity created: ${name}`
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
