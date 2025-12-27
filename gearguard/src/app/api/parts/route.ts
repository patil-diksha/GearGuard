import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all parts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workCenterId = searchParams.get('workCenterId')
    const lowStock = searchParams.get('lowStock')

    const where: any = {}
    if (workCenterId) where.workCenterId = workCenterId
    if (lowStock === 'true') {
      const parts = await prisma.part.findMany()
      const minQuantities = parts.map(p => p.minQuantity)
      where.quantity = {
        lte: Math.max(...minQuantities)
      }
    }

    const parts = await prisma.part.findMany({
      where,
      include: {
        workCenter: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(parts)
  } catch (error) {
    console.error('Error fetching parts:', error)
    return NextResponse.json({ error: 'Failed to fetch parts' }, { status: 500 })
  }
}

// POST create new part
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, modelNo, serialNo, location, workCenterId, cost, quantity, minQuantity, description } = body

    // Validate required fields
    if (!name || !serialNo || !location) {
      return NextResponse.json(
        { error: 'name, serialNo, and location are required' },
        { status: 400 }
      )
    }

    // Check if serial number already exists
    const existingPart = await prisma.part.findUnique({
      where: { serialNo }
    })

    if (existingPart) {
      return NextResponse.json(
        { error: 'Part with this serial number already exists' },
        { status: 409 }
      )
    }

    const part = await prisma.part.create({
      data: {
        name,
        modelNo,
        serialNo,
        location,
        workCenterId,
        cost,
        quantity: quantity || 1,
        minQuantity: minQuantity || 1,
        description
      },
      include: {
        workCenter: true
      }
    })

    return NextResponse.json(part, { status: 201 })
  } catch (error) {
    console.error('Error creating part:', error)
    return NextResponse.json({ error: 'Failed to create part' }, { status: 500 })
  }
}
