import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        assignedMaintenanceTeam: true,
        maintenanceRequests: {
          where: {
            status: {
              notIn: ['REPAIRED', 'SCRAP']
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data: any = {
      name: body.name,
      serialNumber: body.serialNumber,
      location: body.location,
      assignedMaintenanceTeamId: body.assignedMaintenanceTeamId,
      isScrapped: false
    }
    
    if (body.department) data.department = body.department
    if (body.owner) data.owner = body.owner
    if (body.purchaseDate) data.purchaseDate = new Date(body.purchaseDate)
    if (body.warrantyEnd) data.warrantyEnd = new Date(body.warrantyEnd)

    const equipment = await prisma.equipment.create({ data })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error('Error creating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}
