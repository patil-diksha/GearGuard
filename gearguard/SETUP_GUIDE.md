# GearGuard - Setup and Deployment Guide

## Project Overview

GearGuard is a complete maintenance management system with a React frontend and Node.js/PostgreSQL backend. The application includes:

- Equipment management with smart buttons
- Maintenance team management
- Request tracking with Kanban board and calendar views
- Role-based access control
- Auto-fill business logic
- Scrap workflow

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/downloads

## Installation Steps

### Step 1: Database Setup

1. **Start PostgreSQL Service**
   - Windows: Open Services, find "postgresql-x64-xx", and start it
   - Mac/Linux: Use Homebrew or system preferences

2. **Create Database**
   Open pgAdmin or use psql command line:
   ```sql
   CREATE DATABASE gearguard;
   ```

3. **Update Database Credentials**
   Navigate to `gearguard/server/.env` and update:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gearguard
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   ```
   
   **Important**: Replace `your_actual_password` with your PostgreSQL password.

### Step 2: Backend Setup

1. **Navigate to server directory**
   ```bash
   cd gearguard/server
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Seed the database**
   This will create tables and populate with sample data:
   ```bash
   npm run seed
   ```
   
   You should see output like:
   ```
   Starting database seeding...
   Database connection established successfully
   Database models synchronized
   Created 5 users
   Created 3 maintenance teams
   Added team members
   Created 7 equipment
   Created 4 request stages
   Created 6 maintenance requests
   
   ✅ Database seeding completed successfully!
   
   📝 Login Credentials:
     Admin: admin / admin123
     Manager: manager1 / manager123
     Technician 1: tech1 / tech123
     Technician 2: tech2 / tech123
     User: user1 / user123
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
   Database connection established successfully
   Database models synchronized
   Default request stages initialized
   Server is running on port 5000
   Environment: development
   ```

   The API will be available at: `http://localhost:5000`

5. **Test the API**
   Open a new terminal and test the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```
   
   Expected response:
   ```json
   {"status":"ok","timestamp":"2024-12-27T..."}
   ```

### Step 3: Frontend Setup

1. **Navigate to client directory** (in a new terminal)
   ```bash
   cd gearguard/client
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   You should see:
   ```
     VITE v5.x.x  ready in xxx ms
   
     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:5173`

## Running the Application

### For Development

**Terminal 1 - Backend:**
```bash
cd gearguard/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd gearguard/client
npm run dev
```

Both servers must be running simultaneously for the application to work.

## Testing the Application

### 1. Login

- Open http://localhost:5173 in your browser
- Login with any of the default credentials
- Recommended: Start with **admin/admin123** for full access

### 2. Dashboard

After logging in, you'll see the dashboard with:
- Total equipment count
- Total maintenance requests
- Requests by stage (New, In Progress, Repaired, Scrap)
- Pending preventive maintenance

### 3. Equipment Management

Navigate to **Equipment** from the sidebar:

**Create Equipment:**
- Click "Add Equipment" button
- Fill in the details:
  - Name: "Test Machine 01"
  - Serial Number: "TM-2024-001"
  - Category: "Machinery"
  - Location: "Test Floor"
  - Purchase Date: Select from calendar
  - Warranty Expiry: Select from calendar
  - Maintenance Team: Select from dropdown
  - Default Technician: Select from dropdown
  - Department: Select from dropdown
  - Assign to Employee: Optional

**View Equipment:**
- Click on any equipment card to see details
- Notice the "Maintenance" smart button showing open request count
- Click the button to see all requests for that equipment

### 4. Teams Management

Navigate to **Teams** from the sidebar:

**View Teams:**
- See all teams with member count
- View team members and their roles

**Create Team** (Admin/Manager only):
- Click "Add Team"
- Fill in team name and description

**Manage Members** (Admin/Manager only):
- Click "Members" on a team card
- Add or remove technicians

### 5. Maintenance Requests

Navigate to **Requests** from the sidebar:

**Kanban Board View:**
- See requests grouped by stage (New, In Progress, Repaired, Scrap)
- Drag and drop requests between stages
- Notice red strip on overdue requests
- See technician avatars on cards
- Priority colors: Red (High), Yellow (Medium), Green (Low)

**Calendar View:**
- Switch to "Calendar" tab
- See all preventive maintenance requests
- Click on a date to create a new scheduled request
- Click on an event to view/edit request details

**Create Request:**
- Click "Create Request" button
- Fill in details:
  - Subject: "Test Request"
  - Description: "Test maintenance"
  - Type: Select "Corrective" or "Preventive"
  - Priority: Select priority level
  - Equipment: Select equipment
  - **Auto-fill happens here**: Category and Team auto-populate
  - Technician: Assign or leave empty
  - Scheduled Date: Required for preventive maintenance
- Click "Create Request"

**Update Request:**
- Click on a request card
- Update details as needed
- Add notes
- Record duration when completing
- Change stage to move request through workflow

### 6. Scrap Workflow

1. Create a request for an equipment
2. Work on it normally
3. When equipment cannot be repaired, move request to "Scrap" stage
4. System automatically marks equipment as inactive
5. Notes are added indicating equipment was scrapped

## Features Verification Checklist

### Core Features
- [ ] User authentication works with JWT tokens
- [ ] Different users can login with respective credentials
- [ ] Dashboard shows correct statistics
- [ ] Equipment can be created, viewed, and edited
- [ ] Teams can be viewed and managed (by admin/manager)
- [ ] Requests can be created with auto-fill logic
- [ ] Kanban board displays requests correctly
- [ ] Drag and drop works between stages
- [ ] Calendar view shows preventive maintenance
- [ ] Smart buttons on equipment show correct counts

### Advanced Features
- [ ] Overdue requests show red indicator
- [ ] Technician avatars appear on request cards
- [ ] Scrap stage marks equipment as inactive
- [ ] Duration tracking works for completed requests
- [ ] Scheduled date works for preventive maintenance
- [ ] Search and filter functionality works
- [ ] Role-based access control is enforced

## Troubleshooting

### Backend Issues

**Error: "Connection refused" or "Database connection failed"**
- Ensure PostgreSQL is running
- Verify database credentials in `.env` file
- Check if database `gearguard` exists

**Error: "Port 5000 already in use"**
- Change port in `.env` file:
  ```env
  PORT=5001
  ```
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Frontend Issues

**Error: "Cannot connect to API"**
- Ensure backend server is running on port 5000
- Check CORS settings in `server/server.js`
- Verify `CLIENT_URL` in `.env` matches frontend URL

**Error: "Module not found"**
- Run `npm install` in client directory
- Clear cache and try again:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Database Issues

**Seeding fails with foreign key errors**
- The script uses `force: true` which drops tables
- If you have important data, modify `seed.js` to use `force: false`

**Password authentication failed**
- Update `DB_PASSWORD` in `.env` to match your PostgreSQL password
- Reset PostgreSQL password if needed

### General Issues

**Browser shows blank page**
- Open browser console (F12) and check for errors
- Verify both servers are running
- Clear browser cache and cookies

**Login fails with "Invalid credentials"**
- Use default credentials from seeding output
- Check if database was seeded successfully
- Verify password is correct (case-sensitive)

## Production Deployment

### Backend Deployment

1. **Set environment variables for production:**
   ```env
   NODE_ENV=production
   PORT=80
   JWT_SECRET=your_secure_random_secret_key_here
   ```

2. **Use a production database:**
   - Use PostgreSQL on a cloud provider (AWS RDS, Heroku Postgres, etc.)
   - Update database credentials in `.env`

3. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name gearguard
   pm2 startup
   pm2 save
   ```

4. **Set up SSL/HTTPS** (recommended):
   - Use Nginx or Apache as reverse proxy
   - Install SSL certificates (Let's Encrypt)

### Frontend Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to hosting service:**
   - Netlify, Vercel, or AWS S3 + CloudFront
   - Upload the `dist/` folder
   - Configure build settings if needed

3. **Update API URL:**
   - In `client/src/services/api.js`, update `BASE_URL` to production API URL

## Performance Optimization

### Backend
- Add database indexes on frequently queried fields
- Implement connection pooling
- Use caching for frequently accessed data
- Enable compression middleware

### Frontend
- Implement code splitting and lazy loading
- Optimize images and assets
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Security Best Practices

1. **Change default passwords** before production deployment
2. **Use strong JWT secret** (min 32 characters, random)
3. **Enable HTTPS** in production
4. **Implement rate limiting** on API endpoints
5. **Use prepared statements** to prevent SQL injection (Sequelize handles this)
6. **Validate all inputs** on both client and server
7. **Implement CORS properly** (restrict origins in production)
8. **Keep dependencies updated** with `npm audit fix`
9. **Use environment variables** for sensitive data
10. **Implement proper logging** and monitoring

## Support

If you encounter issues not covered in this guide:

1. Check the console for error messages
2. Review the server logs for backend errors
3. Verify all prerequisites are installed correctly
4. Ensure both backend and frontend are running
5. Check database connection and credentials

## Additional Resources

- React Documentation: https://react.dev/
- Express.js Documentation: https://expressjs.com/
- Sequelize Documentation: https://sequelize.org/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Tailwind CSS Documentation: https://tailwindcss.com/docs

---

**Happy Maintaining! 🛠️**
