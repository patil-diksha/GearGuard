import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            assignedMaintenanceTeam: true
          }
        }
      }
    })

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(maintenanceRequest)
  } catch (error) {
    console.error('Error fetching maintenance request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch maintenance request' },
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
    if (body.status === 'SCRAP') {
      // Mark related equipment as scrapped
      const request = await prisma.maintenanceRequest.findUnique({
        where: { id },
        select: { equipmentId: true }
      })

      if (request) {
        await prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { isScrapped: true }
        })
      }
    }

    const data: any = {}
    if (body.subject) data.subject = body.subject
    if (body.type) data.type = body.type
    if (body.equipmentId) data.equipmentId = body.equipmentId
    if (body.assignedTechnician) data.assignedTechnician = body.assignedTechnician
    if (body.scheduledDate) data.scheduledDate = new Date(body.scheduledDate)
    if (body.duration) data.duration = parseFloat(body.duration)
    if (body.status) data.status = body.status

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: {
        equipment: {
          include: {
            assignedMaintenanceTeam: true
          }
        }
      }
    })

    return NextResponse.json(maintenanceRequest)
  } catch (error) {
    console.error('Error updating maintenance request:', error)
    return NextResponse.json(
      { error: 'Failed to update maintenance request' },
      { status: 500 }
    )
  }
}
