# GearGuard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js installed
- PostgreSQL installed and running

### Step 1: Database Setup (1 minute)

1. Open PostgreSQL (pgAdmin or command line)
2. Create database:
   ```sql
   CREATE DATABASE gearguard;
   ```

### Step 2: Configure Backend (30 seconds)

Edit `gearguard/server/.env`:
```env
DB_PASSWORD=your_postgresql_password
```

### Step 3: Install & Run Backend (2 minutes)

```bash
cd gearguard/server
npm install
npm run seed
npm run dev
```

You should see: `Server is running on port 5000`

### Step 4: Install & Run Frontend (1 minute)

Open a new terminal:

```bash
cd gearguard/client
npm install
npm run dev
```

You should see: `Local: http://localhost:5173/`

### Step 5: Login and Start Using!

Open browser: `http://localhost:5173`

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## 📋 Quick Feature Test

1. **Create Equipment**: Go to Equipment → Add Equipment
2. **Create Team**: Go to Teams → Add Team
3. **Create Request**: Go to Requests → Create Request
   - Select equipment → Watch auto-fill magic!
4. **Try Kanban**: Drag requests between stages
5. **Check Calendar**: Switch to Calendar view
6. **Test Smart Button**: View equipment → Click "Maintenance" button

---

## 🔧 Need Help?

See full documentation:
- **Setup Guide**: `SETUP_GUIDE.md` - Detailed installation and troubleshooting
- **Features**: `FEATURES.md` - Complete feature list
- **README**: `README.md` - Project overview and API documentation

---

## 🎯 Key Features to Try

1. **Auto-fill Logic**: When creating a request, select equipment and watch category/team auto-populate
2. **Kanban Board**: Drag requests from "New" to "In Progress" to "Repaired"
3. **Calendar View**: Schedule preventive maintenance and see it on the calendar
4. **Smart Buttons**: On equipment page, click the "Maintenance" button with count badge
5. **Scrap Workflow**: Move a request to "Scrap" stage and watch equipment become inactive
6. **Overdue Indicators**: Notice red strips on overdue request cards

---

## 💡 Tips

- Keep both terminals open (backend and frontend)
- Backend runs on port 5000
- Frontend runs on port 5173
- All data persists in PostgreSQL database
- Seed script creates sample data to test with

---

## 🛠️ Common Issues

**"Database connection failed"**
- Check PostgreSQL is running
- Verify password in `.env`

**"Port already in use"**
- Change port in `.env` file
- Or kill the process using the port

**"Cannot connect to API"**
- Make sure backend server is running
- Check both terminals are open

---

**That's it! You're ready to manage maintenance efficiently! 🎉**
