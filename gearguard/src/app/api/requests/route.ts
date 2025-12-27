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
        }
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
      scheduledDate,
      assignedTechnician,
      duration,
      status 
    } = body

    // Validate required fields
    if (!subject || !equipmentId || !type) {
      return NextResponse.json(
        { error: 'Subject, equipment, and type are required' },
        { status: 400 }
      )
    }

    // Auto-fill logic: Get equipment and its assigned team
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: { assignedMaintenanceTeam: true }
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    // Create maintenance request with auto-filled team
    const data: any = {
      subject,
      description,
      type: type.toUpperCase() as 'CORRECTIVE' | 'PREVENTIVE',
      equipmentId,
      autoFilledTeamId: equipment.assignedMaintenanceTeamId,
      status: status?.toUpperCase() || 'NEW'
    }

    if (assignedTechnician) data.assignedTechnician = assignedTechnician
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate)
    if (duration) data.duration = parseFloat(duration)

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data,
      include: {
        equipment: {
          include: {
            assignedMaintenanceTeam: true
          }
        }
      }
    })

    // Log activity for request creation
    if (equipment.assignedMaintenanceTeamId) {
      await prisma.teamActivity.create({
        data: {
          requestId: maintenanceRequest.id,
          teamId: equipment.assignedMaintenanceTeamId,
          action: `Request created for ${equipment.name}`
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
