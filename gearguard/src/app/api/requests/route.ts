import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all requests with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const teamId = searchParams.get('teamId')
    const equipmentId = searchParams.get('equipmentId')

    const where: any = {}
    if (stage) where.status = stage
    if (teamId) where.autoFilledTeamId = teamId
    if (equipmentId) where.equipmentId = equipmentId

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        equipment: {
          include: {
            assignedMaintenanceTeam: true
          }
        },
        workCenter: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      subject, 
      description,
      type, 
      equipmentId,
      workCenterId,
      scheduledDate,
      assignedTechnician,
      duration,
      status,
      urgency,
      category,
      usedPart,
      activationTicket 
    } = body

    // Validate required fields - either equipmentId OR workCenterId must be provided
    if (!subject || !type) {
      return NextResponse.json(
        { error: 'Subject and type are required' },
        { status: 400 }
      )
    }

    if (!equipmentId && !workCenterId) {
      return NextResponse.json(
        { error: 'Either equipment or work center must be specified' },
        { status: 400 }
      )
    }

    let equipment = null
    let autoFilledTeamId = null

    // Auto-fill logic: Get equipment and its assigned team if equipmentId is provided
    if (equipmentId) {
      equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        include: { assignedMaintenanceTeam: true }
      })

      if (!equipment) {
        return NextResponse.json(
          { error: 'Equipment not found' },
          { status: 404 }
        )
      }

      autoFilledTeamId = equipment.assignedMaintenanceTeamId
    }

    // Create maintenance request
    const data: any = {
      subject,
      description,
      type: type.toUpperCase() as 'CORRECTIVE' | 'PREVENTIVE',
      status: status?.toUpperCase() || 'NEW'
    }

    if (equipmentId) {
      data.equipmentId = equipmentId
      data.autoFilledTeamId = autoFilledTeamId
    }

    if (workCenterId) {
      data.workCenterId = workCenterId
    }

    if (assignedTechnician) data.assignedTechnician = assignedTechnician
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate)
    if (duration) data.duration = parseFloat(duration)
    if (urgency) data.urgency = urgency.toUpperCase()
    if (usedPart) data.usedPart = usedPart
    if (activationTicket) data.activationTicket = activationTicket

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data,
      include: {
        equipment: {
          include: {
            assignedMaintenanceTeam: true
          }
        },
        workCenter: true
      }
    })

    // Log activity for request creation
    if (autoFilledTeamId) {
      await prisma.teamActivity.create({
        data: {
          requestId: maintenanceRequest.id,
          teamId: autoFilledTeamId,
          action: `Request created for ${equipment?.name || 'Work Center'}`
        }
      })
    }

    return NextResponse.json(maintenanceRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    return NextResponse.json(
      { error: 'Failed to create maintenance request' },
      { status: 500 }
    )
  }
}
