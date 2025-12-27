# GearGuard - Ultimate Maintenance Tracker

A comprehensive maintenance management system for tracking company assets (machines, vehicles, computers) and managing maintenance requests.

## Features

### Equipment Management
- Track all company assets with detailed information
- Categorize equipment by department and employee assignment
- Assign maintenance teams and default technicians
- Track purchase dates, warranty information, and locations
- Smart button to view all maintenance requests for specific equipment

### Maintenance Teams
- Create specialized teams (Mechanics, Electricians, IT Support, etc.)
- Assign technicians to teams
- Role-based access control

### Maintenance Requests
- **Corrective Maintenance**: Unplanned repairs for breakdowns
- **Preventive Maintenance**: Planned routine checkups
- Auto-fill logic: Equipment category and team automatically populated
- Request lifecycle: New → In Progress → Repaired/Scrap
- Duration tracking for completed repairs
- Calendar view for scheduled preventive maintenance

### Kanban Board
- Drag-and-drop interface for managing requests
- Visual indicators for overdue requests (red strip)
- Technician avatars on request cards
- Group by stages: New, In Progress, Repaired, Scrap

### Calendar View
- Display all preventive maintenance requests
- Click to schedule new requests on specific dates

### Smart Features
- **Smart Buttons**: On Equipment form, shows count of open requests and links to all requests
- **Scrap Logic**: Automatically marks equipment as inactive when request moves to Scrap stage
- **Auto-fill**: Equipment category and maintenance team auto-populated when creating requests
- **Overdue Detection**: Visual indicators for overdue requests

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT authentication
- Bcrypt for password hashing

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Context API for state management

## Project Structure

```
gearguard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── common/     # Navbar, Sidebar, Modal
│   │   │   ├── equipment/  # Equipment-related components
│   │   │   ├── teams/      # Team-related components
│   │   │   └── requests/   # Request-related components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (Auth)
│   │   └── services/       # API service
│   └── public/
└── server/                 # Node.js backend
    ├── config/            # Database configuration
    ├── controllers/       # Request handlers
    ├── middleware/        # Auth middleware
    ├── models/           # Sequelize models
    ├── routes/           # API routes
    ├── scripts/          # Database seeding
    └── server.js         # Entry point
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

### Backend Setup

1. Navigate to the server directory:
```bash
cd gearguard/server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Copy `.env.example` to `.env` and update the values:
```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gearguard
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

4. Create PostgreSQL database:
```sql
CREATE DATABASE gearguard;
```

5. Seed the database with initial data:
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd gearguard/client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Login Credentials

After seeding the database, you can use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager1 | manager123 |
| Technician | tech1 | tech123 |
| Technician | tech2 | tech123 |
| User | user1 | user123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/users` - Get all users (admin/manager only)

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `GET /api/equipment/:id/requests` - Get equipment requests
- `GET /api/equipment/:id/stats` - Get equipment statistics

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team (admin/manager only)
- `GET /api/teams/:id` - Get team by ID
- `PUT /api/teams/:id` - Update team (admin/manager only)
- `DELETE /api/teams/:id` - Delete team (admin/manager only)
- `POST /api/teams/:id/members` - Add team member (admin/manager only)
- `DELETE /api/teams/:id/members/:user_id` - Remove team member (admin/manager only)

### Maintenance Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create request
- `GET /api/requests/:id` - Get request by ID
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request (admin/manager only)
- `GET /api/requests/stage/:stage_id` - Get requests by stage (for Kanban)
- `GET /api/requests/calendar` - Get requests for calendar view
- `GET /api/requests/stats` - Get request statistics

## Workflow Examples

### Breakdown Request (Corrective Maintenance)
1. User creates a request with subject and equipment
2. System auto-fills equipment category and maintenance team
3. Request starts in "New" stage
4. Manager/technician assigns themselves to the ticket
5. Request moves to "In Progress" stage
6. Technician records hours spent and moves to "Repaired"
7. Completed date is automatically set

### Routine Checkup (Preventive Maintenance)
1. Manager creates request with type "Preventive"
2. Sets scheduled date (e.g., next Monday)
3. Request appears on calendar view
4. Technician sees scheduled work and completes it
5. Request moves through stages like corrective maintenance

### Scrap Equipment
1. If equipment cannot be repaired
2. Move request to "Scrap" stage
3. System automatically marks equipment as inactive
4. Notes are added to indicate equipment was scrapped

## User Roles and Permissions

- **Admin**: Full access to all features
- **Manager**: Can create/edit teams, delete requests, view all data
- **Technician**: Can manage requests, view equipment and teams
- **User**: Can create requests, view assigned equipment

## Development

### Running in Development Mode

Backend:
```bash
cd gearguard/server
npm run dev
```

Frontend:
```bash
cd gearguard/client
npm run dev
```

### Database Migrations

The application uses Sequelize with auto-sync. In production, you should use proper migrations:

```bash
npx sequelize-cli migration:generate --name migration_name
npx sequelize-cli db:migrate
```

## Testing

To test the application:

1. Start both frontend and backend servers
2. Login with default credentials
3. Navigate through different sections:
   - Dashboard: View statistics
   - Equipment: Create and manage equipment
   - Teams: Create teams and assign members
   - Requests: Use Kanban board and calendar view

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### CORS Errors
- Ensure `CLIENT_URL` in `.env` matches frontend URL
- Check backend CORS configuration in `server.js`

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Clear browser cookies/localStorage if needed

## License

ISC

## Support

For issues and questions, please contact the development team.
