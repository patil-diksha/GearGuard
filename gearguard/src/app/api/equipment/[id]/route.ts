import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'details'

    let includeActivities = false
    if (tab === 'activities') {
      includeActivities = true
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        assignedMaintenanceTeam: true,
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' }
        },
        ...(includeActivities && {
          activities: {
            include: {
              team: true
            },
            orderBy: { timestamp: 'desc' }
          }
        })
      }
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    
    // Handle scrap logic
    if (body.isScrapped) {
      // Mark all related maintenance requests as SCRAP
      await prisma.maintenanceRequest.updateMany({
        where: { equipmentId: id },
        data: { status: 'SCRAP' }
      })
    }

    const data: any = {}
    if (body.isScrapped !== undefined) data.isScrapped = body.isScrapped
    if (body.name) data.name = body.name
    if (body.serialNumber) data.serialNumber = body.serialNumber
    if (body.location) data.location = body.location
    if (body.assignedMaintenanceTeamId) data.assignedMaintenanceTeamId = body.assignedMaintenanceTeamId
    if (body.department !== undefined) data.department = body.department || null
    if (body.owner !== undefined) data.owner = body.owner || null
    if (body.purchaseDate) data.purchaseDate = new Date(body.purchaseDate)
    if (body.warrantyEnd) data.warrantyEnd = new Date(body.warrantyEnd)

    const equipment = await prisma.equipment.update({
      where: { id },
      data
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error updating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    )
  }
}
