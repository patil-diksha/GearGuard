# GearGuard 🛡️

A comprehensive equipment management system for tracking, scheduling, and managing maintenance requests. Built with Next.js, Prisma, and modern React technologies.

## 🚀 Features

- **Equipment Management**
  - Track equipment details including name, serial number, department, location, and warranty information
  - Assign equipment to maintenance teams
  - Mark equipment as scrapped when no longer in use
  - View detailed equipment information with purchase and warranty dates

- **Maintenance Team Management**
  - Create and manage maintenance teams
  - Add team members
  - Assign equipment and maintenance requests to teams

- **Maintenance Request System**
  - Create maintenance requests with two types:
    - Corrective: Repair broken equipment
    - Preventive: Scheduled maintenance to prevent breakdowns
  - Auto-assign maintenance teams based on equipment assignments
  - Track request status: NEW → IN_PROGRESS → REPAIRED/SCRAP
  - Schedule maintenance with dates and estimated duration
  - Assign specific technicians to requests

- **Calendar View**
  - Visual calendar interface for viewing scheduled maintenance
  - Easy date selection and navigation
  - Track upcoming maintenance activities

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Reusable UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **react-big-calendar** - Calendar component
- **react-day-picker** - Date picker
- **@tanstack/react-query** - Data fetching and state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7.2.0** - Type-safe ORM
- **PostgreSQL** - Database (via pg)

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **cross-env** - Cross-platform environment variables

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ (recommended: 20+)
- PostgreSQL database
- npm, yarn, pnpm, or bun package manager

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gearguard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gearguard?schema=public"
```

Replace the connection string with your actual PostgreSQL database credentials.

### 4. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

Optionally, seed the database with sample data:

```bash
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
gearguard/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── equipment/     # Equipment CRUD endpoints
│   │   │   ├── requests/      # Maintenance request endpoints
│   │   │   └── teams/         # Maintenance team endpoints
│   │   ├── calendar/          # Calendar page
│   │   ├── equipment/         # Equipment pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/
│       ├── prisma.ts          # Prisma client instance
│       └── utils.ts           # Utility functions
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔌 API Endpoints

### Equipment

- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create new equipment
- `GET /api/equipment/[id]` - Get specific equipment details
- `PUT /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment

### Maintenance Teams

- `GET /api/teams` - Get all maintenance teams
- `POST /api/teams` - Create new team

### Maintenance Requests

- `GET /api/requests` - Get all maintenance requests
- `POST /api/requests` - Create new request
- `PUT /api/requests/[id]` - Update request status
- `DELETE /api/requests/[id]` - Delete request

## 🗄️ Database Schema

### Equipment
- `id` - Unique identifier
- `name` - Equipment name
- `serialNumber` - Unique serial number
- `department` - Department name (optional)
- `owner` - Equipment owner (optional)
- `location` - Equipment location
- `purchaseDate` - Date of purchase
- `warrantyEnd` - Warranty expiration date
- `assignedMaintenanceTeamId` - Assigned team (optional)
- `isScrapped` - Scrap status

### MaintenanceTeam
- `id` - Unique identifier
- `name` - Team name
- `members` - List of team member names

### MaintenanceRequest
- `id` - Unique identifier
- `subject` - Request subject
- `type` - CORRECTIVE or PREVENTIVE
- `equipmentId` - Associated equipment
- `autoFilledTeamId` - Auto-assigned team
- `assignedTechnician` - Assigned technician (optional)
- `scheduledDate` - Scheduled maintenance date (optional)
- `duration` - Estimated duration in hours (optional)
- `status` - NEW, IN_PROGRESS, REPAIRED, or SCRAP

## 🎨 Key Pages

- **Home** (`/`) - Dashboard overview
- **Equipment** (`/equipment`) - List and manage all equipment
- **Equipment Details** (`/equipment/[id]`) - View specific equipment and its maintenance requests
- **Calendar** (`/calendar`) - View scheduled maintenance on a calendar

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## 📦 Database Management

### Generate Prisma Client

```bash
npx prisma generate
```

### Create a New Migration

```bash
npx prisma migrate dev --name migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

### View Database in Prisma Studio

```bash
npx prisma studio
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Check database credentials and permissions

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Ensure all environment variables are set

### Prisma Issues
- Regenerate Prisma client: `npx prisma generate`
- Reset database: `npx prisma migrate reset`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database management with [Prisma](https://www.prisma.io/)
- Icons from [Lucide](https://lucide.dev/)

---

For support, email support@gearguard.com or open an issue in the repository.
