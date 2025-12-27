# GearGuard - Testing Guide with Sample Data

This document provides sample data and API requests to test all pages and functionalities of the GearGuard application.

## Base URL
```
http://localhost:3000
```

## Authentication

### Sign Up
```http
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@gearguard.com",
  "password": "Test123!"
}
```

### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@gearguard.com",
  "password": "Test123!"
}
```

---

## Dashboard Page

### Get Dashboard Stats
```http
GET http://localhost:3000/api/teams
GET http://localhost:3000/api/equipment
GET http://localhost:3000/api/requests?status=NEW
```

**Sample Response:**
- Total Requests: 8
- Active Work Orders: 5
- Pending Activities: 4
- Completed Activities: 5

---

## Equipment Page

### Get All Equipment
```http
GET http://localhost:3000/api/equipment
```

### Get Single Equipment
```http
GET http://localhost:3000/api/equipment/{equipment-id}
```

### Create New Equipment
```http
POST http://localhost:3000/api/equipment
Content-Type: application/json

{
  "name": "New Industrial Pump",
  "serialNumber": "PUMP-2025-001",
  "department": "Manufacturing",
  "location": "Building D - Floor 2",
  "purchaseDate": "2025-01-15",
  "warrantyEnd": "2027-01-15",
  "assignedMaintenanceTeamId": "{team-id}"
}
```

**Sample Equipment Data:**
```json
{
  "name": "HVAC Unit 1",
  "serialNumber": "HVAC-2024-001",
  "department": "Facilities",
  "location": "Building A - Floor 1",
  "purchaseDate": "2024-01-15",
  "warrantyEnd": "2026-01-15",
  "assignedMaintenanceTeamId": "{team-id}"
}
```

---

## Maintenance Requests Page

### Get All Requests
```http
GET http://localhost:3000/api/requests
```

### Filter by Status
```http
GET http://localhost:3000/api/requests?status=NEW
GET http://localhost:3000/api/requests?status=IN_PROGRESS
GET http://localhost:3000/api/requests?status=COMPLETED
```

### Filter by Team
```http
GET http://localhost:3000/api/requests?teamId={team-id}
```

### Create New Request (Corrective)
```http
POST http://localhost:3000/api/requests
Content-Type: application/json

{
  "subject": "Hydraulic pump leaking oil",
  "description": "Significant oil leak detected in hydraulic pump. Needs immediate inspection and repair.",
  "type": "CORRECTIVE",
  "equipmentId": "{equipment-id}",
  "urgency": "HIGH",
  "assignedTechnician": "John Smith",
  "usedPart": "N/A",
  "activationTicket": "REQ-2025-001"
}
```

### Create New Request (Preventive)
```http
POST http://localhost:3000/api/requests
Content-Type: application/json

{
  "subject": "Quarterly hydraulic system check",
  "description": "Routine quarterly inspection of hydraulic system: check oil levels, hoses, seals, and pressure readings.",
  "type": "PREVENTIVE",
  "equipmentId": "{equipment-id}",
  "scheduledDate": "2025-01-15",
  "urgency": "LOW",
  "assignedTechnician": "Mike Johnson",
  "duration": 2.5
}
```

### Create Request for Work Center
```http
POST http://localhost:3000/api/requests
Content-Type: application/json

{
  "subject": "General maintenance needed",
  "description": "Routine maintenance for work center area.",
  "type": "PREVENTIVE",
  "workCenterId": "{work-center-id}",
  "scheduledDate": "2025-01-20",
  "urgency": "MEDIUM",
  "duration": 4.0
}
```

### Get Single Request
```http
GET http://localhost:3000/api/requests/{request-id}
```

### Update Request Status
```http
PATCH http://localhost:3000/api/requests/{request-id}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "assignedTechnician": "Mike Johnson"
}
```

### Get Request Activities
```http
GET http://localhost:3000/api/requests/{request-id}/activities
```

**Sample Request Data:**
```json
{
  "subject": "HVAC Unit not cooling properly",
  "description": "Temperature reading shows 75°F when set to 68°F. Compressor making unusual noises.",
  "type": "CORRECTIVE",
  "status": "NEW",
  "urgency": "MEDIUM",
  "equipmentId": "{equipment-id}",
  "autoFilledTeamId": "{team-id}",
  "assignedTechnician": "John Smith"
}
```

---

## Parts Page

### Get All Parts
```http
GET http://localhost:3000/api/parts
```

### Get Parts by Work Center
```http
GET http://localhost:3000/api/parts?workCenterId={work-center-id}
```

### Get Low Stock Parts
```http
GET http://localhost:3000/api/parts?lowStock=true
```

### Create New Part
```http
POST http://localhost:3000/api/parts
Content-Type: application/json

{
  "name": "Hydraulic Hose Assembly",
  "modelNo": "HH-ASEM-250",
  "serialNo": "PART-2025-001",
  "location": "Production Line A - Storage",
  "workCenterId": "{work-center-id}",
  "cost": 125.00,
  "quantity": 5,
  "minQuantity": 2,
  "description": "High-pressure hydraulic hose assembly"
}
```

**Sample Parts Data:**
```json
{
  "name": "HVAC Compressor",
  "modelNo": "HC-5000",
  "serialNo": "PART-2024-001",
  "location": "Facilities Workshop - Shelf A3",
  "workCenterId": "{work-center-id}",
  "cost": 1250.00,
  "quantity": 2,
  "minQuantity": 1,
  "description": "High-efficiency compressor for HVAC units"
}
```

---

## Work Orders Page

### Get All Work Orders
```http
GET http://localhost:3000/api/work-orders
```

### Create New Work Order
```http
POST http://localhost:3000/api/work-orders
Content-Type: application/json

{
  "requestId": "{request-id}",
  "workCenterId": "{work-center-id}",
  "technicianId": "John Smith",
  "status": "PENDING",
  "priority": "HIGH",
  "estimatedHours": 3.5,
  "notes": "HVAC compressor replacement needed"
}
```

**Sample Work Order Data:**
```json
{
  "requestId": "{request-id}",
  "workCenterId": "{work-center-id}",
  "technicianId": "Mike Johnson",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "estimatedHours": 2.5,
  "actualHours": 1.5,
  "notes": "Generator bearing inspection in progress"
}
```

---

## Activities Page

### Get All Activities
```http
GET http://localhost:3000/api/activities
```

### Get Activities by Status
```http
GET http://localhost:3000/api/activities?status=PENDING
GET http://localhost:3000/api/activities?status=IN_PROGRESS
GET http://localhost:3000/api/activities?status=COMPLETED
```

### Create New Activity
```http
POST http://localhost:3000/api/activities
Content-Type: application/json

{
  "name": "Replace Hydraulic Pump Seals",
  "description": "Replace worn seals in hydraulic pump assembly. Check for damage to surrounding components.",
  "requestId": "{request-id}",
  "workOrderId": "{work-order-id}",
  "workCenterId": "{work-center-id}",
  "technician": "John Smith",
  "startDate": "2025-01-15T09:00:00.000Z",
  "endDate": "2025-01-15T12:00:00.000Z",
  "status": "COMPLETED",
  "partsUsed": ["PART-2024-003"],
  "cost": 85.00,
  "oeeAchieved": 98.5
}
```

### Create Activity with Multiple Parts
```http
POST http://localhost:3000/api/activities
Content-Type: application/json

{
  "name": "Complete Motor Overhaul",
  "description": "Complete motor overhaul including bearings, seals, and electrical components.",
  "requestId": "{request-id}",
  "workOrderId": "{work-order-id}",
  "workCenterId": "{work-center-id}",
  "technician": "Sarah Wilson",
  "startDate": "2025-01-16T08:00:00.000Z",
  "status": "PENDING",
  "partsUsed": ["PART-2024-003", "PART-2024-004"],
  "cost": 975.00,
  "oeeAchieved": null
}
```

**Sample Activity Data:**
```json
{
  "name": "Generator Bearing Inspection",
  "description": "Initial inspection of generator main rotor bearings. Grinding noise confirmed.",
  "requestId": "{request-id}",
  "workOrderId": "{work-order-id}",
  "workCenterId": "{work-center-id}",
  "technician": "Mike Johnson",
  "startDate": "2024-12-27T13:00:00.000Z",
  "endDate": "2024-12-27T14:00:00.000Z",
  "status": "COMPLETED",
  "partsUsed": [],
  "cost": 0,
  "oeeAchieved": 95.5
}
```

---

## Work Centers Page

### Get All Work Centers
```http
GET http://localhost:3000/api/work-centers
```

### Create New Work Center
```http
POST http://localhost:3000/api/work-centers
Content-Type: application/json

{
  "name": "Assembly Line B",
  "location": "Building D - Floor 3",
  "department": "Manufacturing"
}
```

**Sample Work Center Data:**
```json
{
  "name": "Production Line A",
  "location": "Building D - Floor 1",
  "department": "Manufacturing"
}
```

---

## Teams Page

### Get All Teams
```http
GET http://localhost:3000/api/teams
```

**Sample Team Data:**
```json
{
  "name": "Mechanics",
  "members": ["John Smith", "Mike Johnson", "Sarah Wilson"]
}
```

---

## Kanban Page

### Get Data for Kanban Board
```http
GET http://localhost:3000/api/requests?status=NEW
GET http://localhost:3000/api/requests?status=IN_PROGRESS
GET http://localhost:3000/api/requests?status=REPAIRED
GET http://localhost:3000/api/requests?status=COMPLETED
```

### Update Request Status (Drag & Drop)
```http
PATCH http://localhost:3000/api/requests/{request-id}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

---

## Calendar Page

### Get All Requests for Calendar View
```http
GET http://localhost:3000/api/requests?status=NEW&status=IN_PROGRESS
```

**Sample Scheduled Requests:**
```json
{
  "subject": "Quarterly HVAC maintenance",
  "scheduledDate": "2024-12-28T00:00:00.000Z",
  "type": "PREVENTIVE",
  "status": "NEW"
}
```

---

## Testing Scenarios

### Scenario 1: Create Complete Maintenance Workflow
1. **Create Equipment**
   - Use the equipment creation API above
   - Note the `id` returned

2. **Create Maintenance Request**
   - Use the equipment `id` to create a corrective request
   - Note the request `id`

3. **Create Work Order**
   - Use the request `id` to create a work order
   - Note the work order `id`

4. **Create Activities**
   - Create activities linked to the work order
   - Update activity status as work progresses

5. **Update Status**
   - Mark activities as completed
   - Mark work order as completed
   - Mark request as completed

### Scenario 2: Low Stock Alert
1. Create a part with quantity 2 and minQuantity 5
2. Query low stock parts: `GET /api/parts?lowStock=true`
3. The part should appear in the results

### Scenario 3: Preventive Maintenance
1. Create multiple preventive requests with scheduled dates
2. View on Calendar page
3. Create activities and track completion
4. Update OEE (Overall Equipment Effectiveness) scores

### Scenario 4: Team Assignment
1. Get all teams: `GET /api/teams`
2. Create equipment and assign to a team
3. Create a maintenance request
4. Verify the team is auto-filled correctly
5. Assign to a specific technician

### Scenario 5: OEE Tracking
1. Create an activity with OEE score (0-100)
2. Mark as completed with `oeeAchieved: 95.5`
3. Compare OEE scores across different activities
4. Identify equipment with lower OEE for maintenance prioritization

---

## Common Status Values

### Maintenance Request Status
- `NEW` - Newly created request
- `IN_PROGRESS` - Currently being worked on
- `REPAIRED` - Repairs completed, waiting for verification
- `COMPLETED` - Fully completed and verified

### Work Order Status
- `PENDING` - Not started yet
- `IN_PROGRESS` - Currently being worked on
- `COMPLETED` - Work completed

### Activity Status
- `PENDING` - Not started
- `IN_PROGRESS` - Currently working on
- `COMPLETED` - Completed

### Priority Levels
- `LOW` - Routine maintenance
- `MEDIUM` - Standard priority
- `HIGH` - Important but not urgent
- `URGENT` - Immediate attention required

### Urgency Levels
- `LOW` - Low urgency
- `MEDIUM` - Medium urgency
- `HIGH` - High urgency

### Request Types
- `CORRECTIVE` - Breakdown repairs
- `PREVENTIVE` - Scheduled maintenance

---

## Tips for Testing

1. **Test ID Retrieval**: After creating any resource (equipment, request, part, etc.), capture the returned `id` for use in subsequent operations.

2. **Status Transitions**: Test valid status transitions:
   - NEW → IN_PROGRESS → REPAIRED → COMPLETED

3. **Filtering**: Test various filter combinations to ensure data retrieval works correctly.

4. **Error Handling**: Try creating requests with missing required fields to test validation.

5. **Date Handling**: Ensure date formats are ISO 8601 compatible (e.g., `2025-01-15T00:00:00.000Z`).

6. **Team Auto-Fill**: When creating requests with equipmentId, verify that the team is automatically assigned based on the equipment's assigned maintenance team.

7. **OEE Scores**: Test OEE values between 0 and 100 to verify they are correctly stored and displayed.

8. **Parts Usage**: Test activities that use multiple parts to verify the relationship is maintained correctly.

---

## Quick Reference: Seeded Data

After running `npm run seed`, the following data is available:

### Teams (3)
- Mechanics - Members: John Smith, Mike Johnson, Sarah Wilson
- Electricians - Members: David Brown, Emily Davis, Robert Taylor
- IT Support - Members: Alex Anderson, Jessica White, Tom Harris

### Equipment (5)
- HVAC Unit 1 - Building A - Floor 1
- Backup Generator - Building B - Basement
- Main Server Rack - Building A - Server Room
- Electrical Panel A - Building C - Floor 3
- Conveyor Belt System - Building D - Production Line

### Work Centers (3)
- Production Line A (Manufacturing)
- IT Server Room (IT)
- Facilities Workshop (Facilities)

### Parts (8)
- HVAC Compressor ($1,250.00) - Qty: 2
- Cooling Fan 120mm ($45.50) - Qty: 15
- Motor Bearing Set ($85.00) - Qty: 8
- Conveyor Belt Drive Motor ($890.00) - Qty: 1
- Air Filter 20x25x1 ($12.50) - Qty: 25
- Electrical Breaker 50A ($35.00) - Qty: 6
- Thermal Paste 5g ($8.99) - Qty: 20
- Control Panel Switch ($28.00) - Qty: 12

### Work Orders (5)
- Generator bearing inspection (IN_PROGRESS)
- Server rack cooling system repair (COMPLETED)
- Conveyor belt motor replacement (PENDING)
- HVAC unit inspection (PENDING)
- Quarterly HVAC maintenance (PENDING)

### Activity Logs (9)
- Various maintenance activities with different statuses
- Activities linked to parts where applicable
- OEE measurements included

### Maintenance Requests (8)
- Corrective: HVAC unit, generator, server rack, conveyor belt
- Preventive: HVAC maintenance, generator inspection, electrical panel, server rack maintenance

**Note:** You can retrieve the exact IDs by querying the respective endpoints (e.g., `GET /api/teams`, `GET /api/equipment`, etc.)
