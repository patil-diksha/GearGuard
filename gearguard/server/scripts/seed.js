require('dotenv').config()
const { sequelize, User, Equipment, MaintenanceTeam, RequestStage, MaintenanceRequest } = require('../models')

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...')

    // Sync database
    await sequelize.sync({ force: true })
    console.log('Database synchronized')

    // Create users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@gearguard.com',
        password: 'admin123',
        full_name: 'System Administrator',
        role: 'admin'
      },
      {
        username: 'manager1',
        email: 'manager1@gearguard.com',
        password: 'manager123',
        full_name: 'John Manager',
        role: 'manager'
      },
      {
        username: 'tech1',
        email: 'tech1@gearguard.com',
        password: 'tech123',
        full_name: 'Alice Technician',
        role: 'technician'
      },
      {
        username: 'tech2',
        email: 'tech2@gearguard.com',
        password: 'tech123',
        full_name: 'Bob Technician',
        role: 'technician'
      },
      {
        username: 'user1',
        email: 'user1@gearguard.com',
        password: 'user123',
        full_name: 'Charlie User',
        role: 'user'
      }
    ])
    console.log(`Created ${users.length} users`)

    // Create maintenance teams
    const teams = await MaintenanceTeam.bulkCreate([
      {
        name: 'Mechanics',
        description: 'Handles all mechanical equipment repairs and maintenance'
      },
      {
        name: 'Electricians',
        description: 'Electrical systems and equipment specialists'
      },
      {
        name: 'IT Support',
        description: 'Computers, servers, and network equipment'
      }
    ])
    console.log(`Created ${teams.length} maintenance teams`)

    // Add team members
    await teams[0].addMember(users[2]) // Mechanics: Alice
    await teams[0].addMember(users[3]) // Mechanics: Bob
    await teams[1].addMember(users[3]) // Electricians: Bob
    await teams[2].addMember(users[2]) // IT Support: Alice
    console.log('Added team members')

    // Create equipment
    const equipment = await Equipment.bulkCreate([
      {
        name: 'CNC Machine 01',
        serial_number: 'CNC-2024-001',
        category: 'Machinery',
        location: 'Production Floor - Zone A',
        purchase_date: '2024-01-15',
        warranty_expiry: '2026-01-15',
        maintenance_team_id: teams[0].id,
        default_technician_id: users[2].id,
        department_id: 1,
        employee_id: null
      },
      {
        name: 'CNC Machine 02',
        serial_number: 'CNC-2024-002',
        category: 'Machinery',
        location: 'Production Floor - Zone B',
        purchase_date: '2024-02-20',
        warranty_expiry: '2026-02-20',
        maintenance_team_id: teams[0].id,
        default_technician_id: users[2].id,
        department_id: 1,
        employee_id: null
      },
      {
        name: 'Hydraulic Press',
        serial_number: 'HYD-2023-015',
        category: 'Machinery',
        location: 'Production Floor - Zone C',
        purchase_date: '2023-06-10',
        warranty_expiry: '2025-06-10',
        maintenance_team_id: teams[0].id,
        default_technician_id: users[3].id,
        department_id: 1,
        employee_id: null
      },
      {
        name: 'Main Distribution Panel',
        serial_number: 'ELEC-2024-008',
        category: 'Electrical',
        location: 'Electrical Room',
        purchase_date: '2024-03-01',
        warranty_expiry: '2026-03-01',
        maintenance_team_id: teams[1].id,
        default_technician_id: users[3].id,
        department_id: 2,
        employee_id: null
      },
      {
        name: 'Workstation PC 01',
        serial_number: 'PC-IT-2024-001',
        category: 'IT Equipment',
        location: 'Office - Desk 1',
        purchase_date: '2024-01-10',
        warranty_expiry: '2025-01-10',
        maintenance_team_id: teams[2].id,
        default_technician_id: users[2].id,
        department_id: 3,
        employee_id: users[4].id
      },
      {
        name: 'Workstation PC 02',
        serial_number: 'PC-IT-2024-002',
        category: 'IT Equipment',
        location: 'Office - Desk 2',
        purchase_date: '2024-01-12',
        warranty_expiry: '2025-01-12',
        maintenance_team_id: teams[2].id,
        default_technician_id: users[2].id,
        department_id: 3,
        employee_id: null
      },
      {
        name: 'Server Rack',
        serial_number: 'SRV-2023-005',
        category: 'IT Equipment',
        location: 'Server Room',
        purchase_date: '2023-11-01',
        warranty_expiry: '2025-11-01',
        maintenance_team_id: teams[2].id,
        default_technician_id: users[2].id,
        department_id: 3,
        employee_id: null
      }
    ])
    console.log(`Created ${equipment.length} equipment`)

    // Create request stages
    const stages = await RequestStage.bulkCreate([
      { name: 'New', sequence: 1, color: '#3B82F6' },
      { name: 'In Progress', sequence: 2, color: '#F59E0B' },
      { name: 'Repaired', sequence: 3, color: '#10B981' },
      { name: 'Scrap', sequence: 4, color: '#EF4444' }
    ])
    console.log(`Created ${stages.length} request stages`)

    // Create maintenance requests
    const requests = await MaintenanceRequest.bulkCreate([
      {
        subject: 'CNC Machine 01 - Oil Leak',
        description: 'Noticed oil leaking from the hydraulic system. Need immediate inspection.',
        request_type: 'corrective',
        priority: 'high',
        scheduled_date: null,
        duration: null,
        completed_date: null,
        is_overdue: true,
        equipment_id: equipment[0].id,
        stage_id: stages[0].id, // New
        technician_id: users[2].id,
        created_by: users[4].id,
        notes: ''
      },
      {
        subject: 'CNC Machine 02 - Routine Checkup',
        description: 'Quarterly preventive maintenance as per schedule.',
        request_type: 'preventive',
        priority: 'medium',
        scheduled_date: '2025-01-05',
        duration: null,
        completed_date: null,
        is_overdue: false,
        equipment_id: equipment[1].id,
        stage_id: stages[0].id, // New
        technician_id: users[2].id,
        created_by: users[1].id,
        notes: ''
      },
      {
        subject: 'Workstation PC 01 - Slow Performance',
        description: 'Computer running very slow, need to check for malware and upgrade RAM if needed.',
        request_type: 'corrective',
        priority: 'medium',
        scheduled_date: null,
        duration: null,
        completed_date: null,
        is_overdue: false,
        equipment_id: equipment[4].id,
        stage_id: stages[1].id, // In Progress
        technician_id: users[2].id,
        created_by: users[4].id,
        notes: 'Started diagnostic'
      },
      {
        subject: 'Main Distribution Panel - Annual Inspection',
        description: 'Annual safety inspection of the main electrical panel.',
        request_type: 'preventive',
        priority: 'high',
        scheduled_date: '2025-01-10',
        duration: null,
        completed_date: null,
        is_overdue: false,
        equipment_id: equipment[3].id,
        stage_id: stages[0].id, // New
        technician_id: users[3].id,
        created_by: users[1].id,
        notes: ''
      },
      {
        subject: 'Hydraulic Press - Motor Replacement',
        description: 'Motor replaced successfully. Tested and operational.',
        request_type: 'corrective',
        priority: 'high',
        scheduled_date: null,
        duration: 4.5,
        completed_date: '2024-12-20',
        is_overdue: false,
        equipment_id: equipment[2].id,
        stage_id: stages[2].id, // Repaired
        technician_id: users[3].id,
        created_by: users[4].id,
        notes: 'Motor part #M-5500 replaced'
      },
      {
        subject: 'Workstation PC 02 - Hard Drive Failure',
        description: 'Hard drive failed beyond repair. Scrapping the computer.',
        request_type: 'corrective',
        priority: 'low',
        scheduled_date: null,
        duration: 1.0,
        completed_date: '2024-12-15',
        is_overdue: false,
        equipment_id: equipment[5].id,
        stage_id: stages[3].id, // Scrap
        technician_id: users[2].id,
        created_by: users[4].id,
        notes: 'Equipment marked as scrapped. Replacement ordered.'
      }
    ])
    console.log(`Created ${requests.length} maintenance requests`)

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\n📝 Login Credentials:')
    console.log('  Admin: admin / admin123')
    console.log('  Manager: manager1 / manager123')
    console.log('  Technician 1: tech1 / tech123')
    console.log('  Technician 2: tech2 / tech123')
    console.log('  User: user1 / user123')

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('\nDatabase connection closed')
  }
}

seedDatabase()
