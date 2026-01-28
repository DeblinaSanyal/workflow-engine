# Getting Started Guide

Welcome to the Workflow Automation Platform! This guide will walk you through setting up and running the application for the first time.

## Prerequisites Checklist

Before you begin, ensure you have the following installed:

- [ ] Node.js (v18 or higher) - [Download](https://nodejs.org/)
- [ ] PostgreSQL (v14 or higher) - [Download](https://www.postgresql.org/download/)
- [ ] npm (comes with Node.js) or yarn
- [ ] Git (for version control)

Verify installations:
```bash
node --version  # Should be v18+
npm --version   # Should be 8+
psql --version  # Should be 14+
```

## Step-by-Step Setup

### 1. Extract and Navigate to Project

```bash
# Extract the zip file
unzip workflow-automation-platform.zip
cd workflow-engine
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ../..
```

### 3. Database Setup

#### Create Database

**Option A: Using psql (Command Line)**
```bash
psql -U postgres
CREATE DATABASE workflow_engine;
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click "Databases"
3. Select "Create > Database"
4. Name it "workflow_engine"
5. Click "Save"

#### Verify Database Creation
```bash
psql -U postgres -d workflow_engine -c "SELECT version();"
```

### 4. Configure Environment Variables

```bash
cd packages/backend
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password
DB_DATABASE=workflow_engine

PORT=3000
NODE_ENV=development
```

### 5. Start the Application

#### Terminal 1: Backend Server
```bash
cd packages/backend
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📝 API available at http://localhost:3000/api
```

#### Terminal 2: Frontend Server
```bash
cd packages/frontend
npm run dev
```

You should see:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Verify Installation

1. Open browser to `http://localhost:5173`
2. You should see the Workflows page
3. Click "New Workflow" to open the editor
4. Drag a node from the left panel onto the canvas
5. Success! 🎉

## Quick Start Tutorial

### Creating Your First Workflow

1. **Create New Workflow**
   - Click "New Workflow" button
   - You'll see the visual workflow editor

2. **Add Nodes**
   - Drag "HTTP Request" from the left panel onto canvas
   - Drag "Data Transform" onto canvas
   - Drag another node of your choice

3. **Connect Nodes**
   - Click and drag from the blue dot (output) on the right of one node
   - Connect to the gray dot (input) on the left of another node

4. **Configure Nodes**
   - Click on a node to select it
   - The right panel shows configuration options
   - Fill in required parameters (marked with *)

5. **Save Workflow**
   - Click "Save New" in the top toolbar
   - Give your workflow a name
   - Click save again to confirm

6. **Execute Workflow**
   - Click "Execute" button
   - Watch the execution happen
   - View results in execution details

### Example: Simple HTTP Request Workflow

Let's create a workflow that fetches data from an API:

1. **Add HTTP Request Node**
   - Drag "HTTP Request" onto canvas
   - Click to configure:
     - Method: GET
     - URL: https://api.github.com/users/github
     - Headers: {}

2. **Add Data Transform Node**
   - Drag "Data Transform" next to HTTP Request
   - Connect HTTP Request output → Data Transform input
   - Click Data Transform to configure:
     - Code: `return { name: input.body.name, repos: input.body.public_repos }`

3. **Save & Execute**
   - Name: "GitHub User Lookup"
   - Click Save
   - Click Execute
   - View the transformed result!

## Common Issues & Solutions

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=3001
```

### Issue: Database Connection Failed

**Error:** `connection refused` or `role does not exist`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   
   # Windows
   Check Services in Task Manager
   ```

2. Check credentials in `.env`
3. Test connection:
   ```bash
   psql -U postgres -d workflow_engine
   ```

### Issue: Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If issue persists, clear npm cache
npm cache clean --force
npm install
```

### Issue: TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# If errors persist, check tsconfig.json
# Ensure all paths are correct
```

## Architecture Quick Reference

```
workflow-engine/
├── packages/
│   ├── backend/          # Node.js server
│   │   ├── src/
│   │   │   ├── domain/          # Business logic
│   │   │   ├── application/     # Use cases
│   │   │   ├── infrastructure/  # Database, external services
│   │   │   └── presentation/    # REST API
│   │   └── package.json
│   │
│   └── frontend/         # React app
│       ├── src/
│       │   ├── components/      # UI components
│       │   ├── pages/          # Page views
│       │   ├── services/       # API client
│       │   └── stores/         # State management
│       └── package.json
│
└── package.json          # Root workspace
```

## Development Workflow

### Adding a New Node Type

1. Create node implementation:
```typescript
// packages/backend/src/domain/nodes/implementations/MyNode.ts
export class MyNode extends BaseNode { ... }
```

2. Register in `packages/backend/src/index.ts`:
```typescript
NodeRegistry.register(new MyNode());
```

3. Restart backend server
4. Node appears in frontend palette automatically!

### Making API Changes

1. Update controller/routes in `packages/backend/src/presentation/`
2. Update API client in `packages/frontend/src/services/api.ts`
3. Update TypeScript types to match
4. Restart servers to apply changes

### Styling Changes

1. Edit components in `packages/frontend/src/components/`
2. Use Tailwind CSS classes
3. Changes hot-reload automatically

## Production Deployment

### Build for Production

```bash
# Backend
cd packages/backend
npm run build
NODE_ENV=production npm start

# Frontend
cd packages/frontend
npm run build
# Serve dist/ folder with nginx or similar
```

### Environment Configuration

Production `.env`:
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=production_user
DB_PASSWORD=secure_production_password
DB_DATABASE=workflow_engine
PORT=3000
```

### Database Migrations

For production, disable auto-sync:
```typescript
// packages/backend/src/infrastructure/database/config.ts
synchronize: false  // Change to false
```

Generate and run migrations using TypeORM CLI.

## Next Steps

Now that you're set up:

1. **Explore Built-in Nodes**
   - HTTP Request
   - Data Transform
   - Conditional

2. **Create Custom Nodes**
   - Follow the example in README.md
   - Add your own business logic

3. **Build Complex Workflows**
   - Chain multiple nodes
   - Use conditionals for branching logic
   - Transform data between nodes

4. **Integrate External Services**
   - Create nodes for your APIs
   - Add database connections
   - Connect to third-party services

## Resources

- **Documentation**: See README.md for architecture details
- **API Reference**: Visit http://localhost:3000/api after starting backend
- **React Flow Docs**: https://reactflow.dev/
- **TypeORM Docs**: https://typeorm.io/

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review the console logs (both frontend and backend)
3. Verify all dependencies are installed
4. Ensure database is running and accessible
5. Check that ports 3000 and 5173 are available

## Success Checklist

- [ ] Dependencies installed
- [ ] Database created and accessible
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Can create and save workflows
- [ ] Can execute workflows successfully
- [ ] Nodes appear in palette and can be configured

Congratulations! You're ready to build powerful automation workflows! 🚀
