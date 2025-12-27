import { PrismaClient } from '@prisma/client'
import { MaintenanceRequestType, MaintenanceRequestStatus } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create Maintenance Teams
  const mechanicsTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'Mechanics',
      members: ['John Smith', 'Mike Johnson', 'Sarah Wilson']
    }
  })

  const electriciansTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'Electricians',
      members: ['David Brown', 'Emily Davis', 'Robert Taylor']
    }
  })

  const itSupportTeam = await prisma.maintenanceTeam.create({
    data: {
      name: 'IT Support',
      members: ['Alex Anderson', 'Jessica White', 'Tom Harris']
    }
  })

  // Create Equipment
  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'HVAC Unit 1',
      serialNumber: 'HVAC-2024-001',
      department: 'Facilities',
      location: 'Building A - Floor 1',
      purchaseDate: new Date('2024-01-15'),
      warrantyEnd: new Date('2026-01-15'),
      assignedMaintenanceTeamId: mechanicsTeam.id
    }
  })

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'Backup Generator',
      serialNumber: 'GEN-2024-005',
      department: 'Facilities',
      location: 'Building B - Basement',
      purchaseDate: new Date('2024-03-20'),
      warrantyEnd: new Date('2027-03-20'),
      assignedMaintenanceTeamId: mechanicsTeam.id
    }
  })

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'Main Server Rack',
      serialNumber: 'SRV-2024-012',
      owner: 'IT Department',
      location: 'Building A - Server Room',
      purchaseDate: new Date('2024-02-10'),
      warrantyEnd: new Date('2026-02-10'),
      assignedMaintenanceTeamId: itSupportTeam.id
    }
  })

  const equipment4 = await prisma.equipment.create({
    data: {
      name: 'Electrical Panel A',
      serialNumber: 'ELEC-2024-030',
      department: 'Facilities',
      location: 'Building C - Floor 3',
      purchaseDate: new Date('2024-04-05'),
      warrantyEnd: new Date('2026-04-05'),
      assignedMaintenanceTeamId: electriciansTeam.id
    }
  })

  const equipment5 = await prisma.equipment.create({
    data: {
      name: 'Conveyor Belt System',
      serialNumber: 'CNV-2024-045',
      department: 'Manufacturing',
      location: 'Building D - Production Line',
      purchaseDate: new Date('2024-01-20'),
      warrantyEnd: new Date('2026-01-20'),
      assignedMaintenanceTeamId: mechanicsTeam.id
    }
  })

  // Create Maintenance Requests - Corrective (Breakdown)
  const request1 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'HVAC Unit not cooling properly',
      description: 'Temperature reading shows 75°F when set to 68°F. Compressor making unusual noises. Need immediate inspection.',
      type: MaintenanceRequestType.CORRECTIVE,
      equipmentId: equipment1.id,
      autoFilledTeamId: mechanicsTeam.id,
      assignedTechnician: 'John Smith',
      status: MaintenanceRequestStatus.NEW
    }
  })

  const request2 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Backup generator making unusual noise',
      description: 'Generator producing grinding sound during test run. Suspected bearing issue in main rotor.',
      type: MaintenanceRequestType.CORRECTIVE,
      equipmentId: equipment2.id,
      autoFilledTeamId: mechanicsTeam.id,
      assignedTechnician: 'Mike Johnson',
      status: MaintenanceRequestStatus.IN_PROGRESS,
      duration: 2.5
    }
  })

  // Add activity for request2
  await prisma.teamActivity.create({
    data: {
      requestId: request2.id,
      teamId: mechanicsTeam.id,
      action: 'Request assigned to Mike Johnson'
    }
  })

  const request3 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Server rack temperature warning',
      description: 'Critical temperature alert on server rack. Cooling system needs inspection. Possible fan failure.',
      type: MaintenanceRequestType.CORRECTIVE,
      equipmentId: equipment3.id,
      autoFilledTeamId: itSupportTeam.id,
      assignedTechnician: 'Alex Anderson',
      status: MaintenanceRequestStatus.REPAIRED,
      duration: 3.0
    }
  })

  // Add activities for request3
  await prisma.teamActivity.createMany({
    data: [
      {
        requestId: request3.id,
        teamId: itSupportTeam.id,
        action: 'Request created and assigned to Alex Anderson'
      },
      {
        requestId: request3.id,
        teamId: itSupportTeam.id,
        action: 'Status changed to In Progress'
      },
      {
        requestId: request3.id,
        teamId: itSupportTeam.id,
        action: 'Completed - Cooling fan replaced successfully'
      },
      {
        requestId: request3.id,
        teamId: itSupportTeam.id,
        action: 'Status changed to Repaired'
      }
    ]
  })

  const request4 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Conveyor belt stopped working',
      description: 'Production line B conveyor belt seized. Motor not responding. Immediate repair needed to resume production.',
      type: MaintenanceRequestType.CORRECTIVE,
      equipmentId: equipment5.id,
      autoFilledTeamId: mechanicsTeam.id,
      assignedTechnician: 'Sarah Wilson',
      status: MaintenanceRequestStatus.NEW
    }
  })

  // Create Maintenance Requests - Preventive
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const twoWeeks = new Date(today)
  twoWeeks.setDate(twoWeeks.getDate() + 14)

  const request5 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Quarterly HVAC maintenance',
      description: 'Routine quarterly inspection: check filters, refrigerant levels, electrical connections, and overall system performance.',
      type: MaintenanceRequestType.PREVENTIVE,
      equipmentId: equipment1.id,
      autoFilledTeamId: mechanicsTeam.id,
      scheduledDate: tomorrow,
      status: MaintenanceRequestStatus.NEW
    }
  })

  const request6 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Monthly generator inspection',
      description: 'Monthly inspection checklist: oil levels, fuel filters, battery health, load test, and safety system verification.',
      type: MaintenanceRequestType.PREVENTIVE,
      equipmentId: equipment2.id,
      autoFilledTeamId: mechanicsTeam.id,
      scheduledDate: nextWeek,
      status: MaintenanceRequestStatus.NEW
    }
  })

  const request7 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Electrical panel inspection',
      description: 'Bi-monthly electrical panel inspection: check for overheating, loose connections, voltage readings, and safety compliance.',
      type: MaintenanceRequestType.PREVENTIVE,
      equipmentId: equipment4.id,
      autoFilledTeamId: electriciansTeam.id,
      scheduledDate: twoWeeks,
      status: MaintenanceRequestStatus.NEW
    }
  })

  // Create one overdue request (scheduled date in the past)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const request8 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Server rack maintenance',
      description: 'Overdue preventive maintenance: cable management, dust cleaning, firmware updates, and thermal paste replacement.',
      type: MaintenanceRequestType.PREVENTIVE,
      equipmentId: equipment3.id,
      autoFilledTeamId: itSupportTeam.id,
      scheduledDate: yesterday,
      status: MaintenanceRequestStatus.NEW
    }
  })

  console.log('Seed data created successfully!')
  console.log(`Created 5 equipment items`)
  console.log(`Created 3 maintenance teams`)
  console.log(`Created 8 maintenance requests`)
  console.log(`Created 5 team activity logs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
