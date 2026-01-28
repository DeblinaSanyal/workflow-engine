# Complete Fix Guide - All Path Issues

## Backend Import Errors - Apply These Fixes

If you see errors like:
- `Cannot find module './BaseNode'`
- `Cannot find module '../../domain/entities/Workflow'`

### Fix 1: HttpRequestNode.ts

**File:** `packages\backend\src\domain\nodes\implementations\HttpRequestNode.ts`

**Line 2**, change from:
```typescript
import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from './BaseNode';
```

**To:**
```typescript
import { BaseNode, NodeExecutionContext, NodeExecutionResult, NodeMetadata } from '../BaseNode';
```

### Fix 2: WorkflowEntity.ts

**File:** `packages\backend\src\infrastructure\database\entities\WorkflowEntity.ts`

**Line 2**, change from:
```typescript
import { WorkflowNode, WorkflowConnection, WorkflowSettings, WorkflowStatus } from '../../domain/entities/Workflow';
```

**To:**
```typescript
import { WorkflowNode, WorkflowConnection, WorkflowSettings, WorkflowStatus } from '../../../domain/entities/Workflow';
```

### Fix 3: WorkflowExecutionEntity.ts

**File:** `packages\backend\src\infrastructure\database\entities\WorkflowExecutionEntity.ts`

**Line 2**, change from:
```typescript
import { ExecutionStatus, ExecutionMode, NodeExecutionData } from '../../domain/entities/WorkflowExecution';
```

**To:**
```typescript
import { ExecutionStatus, ExecutionMode, NodeExecutionData } from '../../../domain/entities/WorkflowExecution';
```

## After Fixing - Test Backend

```bash
cd packages\backend
npm run dev:no-db
```

You should see:
```
============================================================
🚀 Workflow Engine Server Ready!
============================================================
📝 API:     http://localhost:3000/api
🗄️  Storage: In-Memory (no database required)
⚙️  Nodes:   3 types registered
============================================================
```

## How to See Nodes in Frontend

Once both servers are running:

### Step 1: Verify Backend Has Nodes

Open browser to: **http://localhost:3000/api/nodes**

You should see JSON with 3 nodes:
```json
{
  "success": true,
  "data": [
    {
      "name": "httpRequest",
      "displayName": "HTTP Request",
      "icon": "🌐",
      "category": "action",
      ...
    },
    {
      "name": "dataTransform",
      "displayName": "Data Transform",
      "icon": "🔄",
      ...
    },
    {
      "name": "conditional",
      "displayName": "If Condition",
      "icon": "🔀",
      ...
    }
  ]
}
```

### Step 2: Open Frontend

Go to: **http://localhost:5173**

### Step 3: Create New Workflow

Click the **"+ New Workflow"** button (top right)

### Step 4: See Nodes in Left Panel

You should see:

```
┌─────────────────────┐
│  Node Library       │
│                     │
│  [Search box]       │
│                     │
│  ACTION             │
│  ┌────────────────┐ │
│  │ 🌐 HTTP Request│ │  ← Drag this!
│  │ Make HTTP...   │ │
│  └────────────────┘ │
│                     │
│  TRANSFORM          │
│  ┌────────────────┐ │
│  │ 🔄 Data Trans..│ │  ← Or this!
│  │ Transform...   │ │
│  └────────────────┘ │
│                     │
│  CONTROL            │
│  ┌────────────────┐ │
│  │ 🔀 If Condition│ │  ← Or this!
│  │ Route based... │ │
│  └────────────────┘ │
└─────────────────────┘
```

### Step 5: Drag Node onto Canvas

1. Click and hold on any node (e.g., "HTTP Request")
2. Drag it onto the canvas (center area)
3. Release mouse button
4. Node appears on canvas!

## If Nodes Don't Appear

### Check 1: Is Backend Running?

Look at your backend terminal. Should show:
```
⚙️  Nodes:   3 types registered
```

If not, backend crashed - check for import errors.

### Check 2: Check Browser Console

Press F12 in browser, click "Console" tab.

Look for errors like:
- `Failed to fetch` → Backend not running
- `Network error` → Wrong port
- `CORS error` → Backend/frontend misconfiguration

### Check 3: Verify API Connection

In browser console (F12), type:
```javascript
fetch('http://localhost:3000/api/nodes')
  .then(r => r.json())
  .then(d => console.log(d))
```

Should show the 3 nodes. If you get error:
- Backend is not running
- Backend is on wrong port
- CORS is blocking (shouldn't happen with our setup)

### Check 4: Frontend Build Issues

If frontend won't start or has errors:

```bash
cd packages\frontend

# Try these in order:
npm install react-router-dom --save
npm install uuid --save
npm install @types/uuid --save-dev

npm run dev
```

## Full Working Setup Checklist

- [ ] Backend: Fixed all import paths
- [ ] Backend: Runs without errors (`npm run dev:no-db`)
- [ ] Backend: Shows "3 types registered"
- [ ] Backend: http://localhost:3000/api/nodes shows JSON
- [ ] Frontend: Installs without errors
- [ ] Frontend: Runs on port 5173
- [ ] Frontend: Opens in browser
- [ ] Frontend: "New Workflow" button visible
- [ ] Frontend: Clicking "New Workflow" opens editor
- [ ] Frontend: Left panel shows 3 nodes
- [ ] Frontend: Can drag nodes onto canvas

## Quick Test Workflow

Once nodes appear:

1. Drag **HTTP Request** to canvas
2. Click it to configure
3. Set URL to: `https://api.github.com/users/github`
4. Set Method to: `GET`
5. Click **Save New**
6. Name it: "Test"
7. Click **Execute**
8. Should see success!

## Still Not Working?

Download fresh archive from the updated `workflow-engine.tar.gz` file - all fixes are already applied there.
