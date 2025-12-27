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
  // Clean up existing data in reverse order of dependencies
  await prisma.activity.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.part.deleteMany()
  await prisma.workCenter.deleteMany()
  await prisma.teamActivity.deleteMany()
  await prisma.maintenanceRequest.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.maintenanceTeam.deleteMany()

  console.log('Existing data cleared successfully!')

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

  // Create Work Centers
  const workCenter1 = await prisma.workCenter.create({
    data: {
      name: 'Production Line A',
      location: 'Building D - Floor 1',
      department: 'Manufacturing'
    }
  })

  const workCenter2 = await prisma.workCenter.create({
    data: {
      name: 'IT Server Room',
      location: 'Building A - Floor 3',
      department: 'IT'
    }
  })

  const workCenter3 = await prisma.workCenter.create({
    data: {
      name: 'Facilities Workshop',
      location: 'Building B - Ground Floor',
      department: 'Facilities'
    }
  })

  // Create Parts
  const part1 = await prisma.part.create({
    data: {
      name: 'HVAC Compressor',
      modelNo: 'HC-5000',
      serialNo: 'PART-2024-001',
      location: 'Facilities Workshop - Shelf A3',
      workCenterId: workCenter3.id,
      cost: 1250.00,
      quantity: 2,
      minQuantity: 1,
      description: 'High-efficiency compressor for HVAC units'
    }
  })

  const part2 = await prisma.part.create({
    data: {
      name: 'Cooling Fan 120mm',
      modelNo: 'CF-120-PRO',
      serialNo: 'PART-2024-002',
      location: 'IT Server Room - Cabinet B2',
      workCenterId: workCenter2.id,
      cost: 45.50,
      quantity: 15,
      minQuantity: 5,
      description: 'High-performance cooling fan for server racks'
    }
  })

  const part3 = await prisma.part.create({
    data: {
      name: 'Motor Bearing Set',
      modelNo: 'MB-SET-3000',
      serialNo: 'PART-2024-003',
      location: 'Facilities Workshop - Shelf B1',
      workCenterId: workCenter3.id,
      cost: 85.00,
      quantity: 8,
      minQuantity: 3,
      description: 'Complete bearing set for industrial motors'
    }
  })

  const part4 = await prisma.part.create({
    data: {
      name: 'Conveyor Belt Drive Motor',
      modelNo: 'CDM-500',
      serialNo: 'PART-2024-004',
      location: 'Production Line A - Storage',
      workCenterId: workCenter1.id,
      cost: 890.00,
      quantity: 1,
      minQuantity: 1,
      description: 'Drive motor for conveyor belt systems'
    }
  })

  const part5 = await prisma.part.create({
    data: {
      name: 'Air Filter 20x25x1',
      modelNo: 'AF-2025-01',
      serialNo: 'PART-2024-005',
      location: 'Facilities Workshop - Shelf A5',
      workCenterId: workCenter3.id,
      cost: 12.50,
      quantity: 25,
      minQuantity: 10,
      description: 'Standard HVAC air filter'
    }
  })

  const part6 = await prisma.part.create({
    data: {
      name: 'Electrical Breaker 50A',
      modelNo: 'EB-50A-S',
      serialNo: 'PART-2024-006',
      location: 'Facilities Workshop - Shelf C1',
      workCenterId: workCenter3.id,
      cost: 35.00,
      quantity: 6,
      minQuantity: 2,
      description: '50A circuit breaker for electrical panels'
    }
  })

  const part7 = await prisma.part.create({
    data: {
      name: 'Thermal Paste 5g',
      modelNo: 'TP-5G-PRE',
      serialNo: 'PART-2024-007',
      location: 'IT Server Room - Cabinet A1',
      workCenterId: workCenter2.id,
      cost: 8.99,
      quantity: 20,
      minQuantity: 8,
      description: 'High-performance thermal paste for CPUs'
    }
  })

  const part8 = await prisma.part.create({
    data: {
      name: 'Control Panel Switch',
      modelNo: 'CPS-3POS',
      serialNo: 'PART-2024-008',
      location: 'Facilities Workshop - Shelf B4',
      workCenterId: workCenter3.id,
      cost: 28.00,
      quantity: 12,
      minQuantity: 4,
      description: '3-position toggle switch for control panels'
    }
  })

  // Create Work Orders
  const workOrder1 = await prisma.workOrder.create({
    data: {
      requestId: request2.id,
      workCenterId: workCenter3.id,
      technicianId: 'Mike Johnson',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      estimatedHours: 2.5,
      actualHours: 1.5,
      notes: 'Generator bearing inspection in progress'
    }
  })

  const workOrder2 = await prisma.workOrder.create({
    data: {
      requestId: request3.id,
      workCenterId: workCenter2.id,
      technicianId: 'Alex Anderson',
      status: 'COMPLETED',
      priority: 'URGENT',
      estimatedHours: 3.0,
      actualHours: 2.75,
      notes: 'Server rack cooling system repair completed'
    }
  })

  const workOrder3 = await prisma.workOrder.create({
    data: {
      requestId: request4.id,
      workCenterId: workCenter1.id,
      technicianId: 'Sarah Wilson',
      status: 'PENDING',
      priority: 'URGENT',
      estimatedHours: 4.0,
      notes: 'Conveyor belt motor replacement - awaiting parts'
    }
  })

  const workOrder4 = await prisma.workOrder.create({
    data: {
      requestId: request1.id,
      workCenterId: workCenter3.id,
      technicianId: 'John Smith',
      status: 'PENDING',
      priority: 'MEDIUM',
      estimatedHours: 2.0,
      notes: 'Scheduled HVAC unit inspection'
    }
  })

  const workOrder5 = await prisma.workOrder.create({
    data: {
      requestId: request5.id,
      workCenterId: workCenter3.id,
      technicianId: 'John Smith',
      status: 'PENDING',
      priority: 'LOW',
      estimatedHours: 1.5,
      notes: 'Quarterly HVAC maintenance - preventive'
    }
  })

  // Create Activity Logs
  const activity1 = await prisma.activity.create({
    data: {
      requestId: request2.id,
      workOrderId: workOrder1.id,
      name: 'Generator Bearing Inspection',
      description: 'Initial inspection of generator main rotor bearings. Grinding noise confirmed.',
      workCenterId: workCenter3.id,
      technician: 'Mike Johnson',
      startDate: new Date(today.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      endDate: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'COMPLETED',
      partsUsed: [],
      cost: 0,
      oeeAchieved: 95.5
    }
  })

  const activity2 = await prisma.activity.create({
    data: {
      requestId: request2.id,
      workOrderId: workOrder1.id,
      name: 'Bearing Lubrication',
      description: 'Applied high-temperature grease to generator bearings. Noise reduced significantly.',
      workCenterId: workCenter3.id,
      technician: 'Mike Johnson',
      startDate: new Date(today.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'IN_PROGRESS',
      partsUsed: [],
      cost: 15.00,
      oeeAchieved: null
    }
  })

  const activity3 = await prisma.activity.create({
    data: {
      requestId: request3.id,
      workOrderId: workOrder2.id,
      name: 'Server Rack Cooling Fan Replacement',
      description: 'Replaced failed cooling fan in server rack. Temperature now stable.',
      workCenterId: workCenter2.id,
      technician: 'Alex Anderson',
      startDate: new Date(today.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      endDate: new Date(today.getTime() - 22 * 60 * 60 * 1000), // 22 hours ago
      status: 'COMPLETED',
      partsUsed: [part2.serialNo],
      cost: 45.50,
      oeeAchieved: 99.2
    }
  })

  const activity4 = await prisma.activity.create({
    data: {
      requestId: request3.id,
      workOrderId: workOrder2.id,
      name: 'Thermal Paste Replacement',
      description: 'Cleaned and reapplied thermal paste to all server CPUs.',
      workCenterId: workCenter2.id,
      technician: 'Alex Anderson',
      startDate: new Date(today.getTime() - 22 * 60 * 60 * 1000), // 22 hours ago
      endDate: new Date(today.getTime() - 21 * 60 * 60 * 1000), // 21 hours ago
      status: 'COMPLETED',
      partsUsed: [part7.serialNo],
      cost: 8.99,
      oeeAchieved: 98.8
    }
  })

  const activity5 = await prisma.activity.create({
    data: {
      requestId: request4.id,
      workOrderId: workOrder3.id,
      name: 'Conveyor Belt Motor Diagnosis',
      description: 'Diagnosed conveyor belt motor failure. Confirmed stator winding damage. Requires replacement.',
      workCenterId: workCenter1.id,
      technician: 'Sarah Wilson',
      startDate: new Date(today.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      endDate: new Date(today.getTime() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
      status: 'COMPLETED',
      partsUsed: [],
      cost: 0,
      oeeAchieved: 0
    }
  })

  const activity6 = await prisma.activity.create({
    data: {
      requestId: request4.id,
      workOrderId: workOrder3.id,
      name: 'Motor Replacement',
      description: 'Replace failed conveyor belt drive motor with new unit. Test and verify operation.',
      workCenterId: workCenter1.id,
      technician: 'Sarah Wilson',
      status: 'PENDING',
      partsUsed: [part4.serialNo],
      cost: 890.00,
      oeeAchieved: null
    }
  })

  const activity7 = await prisma.activity.create({
    data: {
      requestId: request1.id,
      workOrderId: workOrder4.id,
      name: 'HVAC Compressor Check',
      description: 'Inspect HVAC compressor operation and refrigerant levels.',
      workCenterId: workCenter3.id,
      technician: 'John Smith',
      status: 'PENDING',
      partsUsed: [],
      cost: 0,
      oeeAchieved: null
    }
  })

  const activity8 = await prisma.activity.create({
    data: {
      requestId: request5.id,
      workOrderId: workOrder5.id,
      name: 'HVAC Filter Replacement',
      description: 'Replace HVAC air filters and check airflow.',
      workCenterId: workCenter3.id,
      technician: 'John Smith',
      status: 'PENDING',
      partsUsed: [part5.serialNo],
      cost: 12.50,
      oeeAchieved: null
    }
  })

  const activity9 = await prisma.activity.create({
    data: {
      requestId: request5.id,
      workOrderId: workOrder5.id,
      name: 'HVAC Electrical Inspection',
      description: 'Inspect all electrical connections and control systems for HVAC unit.',
      workCenterId: workCenter3.id,
      technician: 'John Smith',
      status: 'PENDING',
      partsUsed: [],
      cost: 0,
      oeeAchieved: null
    }
  })

  // Link parts to activities
  await prisma.activity.update({
    where: { id: activity3.id },
    data: {
      parts: {
        connect: { id: part2.id }
      }
    }
  })

  await prisma.activity.update({
    where: { id: activity4.id },
    data: {
      parts: {
        connect: { id: part7.id }
      }
    }
  })

  await prisma.activity.update({
    where: { id: activity6.id },
    data: {
      parts: {
        connect: { id: part4.id }
      }
    }
  })

  await prisma.activity.update({
    where: { id: activity8.id },
    data: {
      parts: {
        connect: { id: part5.id }
      }
    }
  })

  console.log('Seed data created successfully!')
  console.log(`Created 5 equipment items`)
  console.log(`Created 3 maintenance teams`)
  console.log(`Created 8 maintenance requests`)
  console.log(`Created 5 team activity logs`)
  console.log(`Created 3 work centers`)
  console.log(`Created 8 parts`)
  console.log(`Created 5 work orders`)
  console.log(`Created 9 activity logs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
