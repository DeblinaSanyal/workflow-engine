# Quick Fix for Import Error

If you're getting the error:
```
Error: Cannot find module '../../domain/entities/Workflow'
```

## Option 1: Apply Quick Fix (Fastest)

Run these commands in your backend directory:

```bash
cd packages/backend

# Fix 1: Update WorkflowEntity.ts
# Open src/infrastructure/database/entities/WorkflowEntity.ts
# Change line 2 from:
#   import { WorkflowNode, WorkflowConnection, WorkflowSettings, WorkflowStatus } from '../../domain/entities/Workflow';
# To:
#   import { WorkflowNode, WorkflowConnection, WorkflowSettings, WorkflowStatus } from '../../../domain/entities/Workflow';

# Fix 2: Update WorkflowExecutionEntity.ts  
# Open src/infrastructure/database/entities/WorkflowExecutionEntity.ts
# Change line 2 from:
#   import { ExecutionStatus, ExecutionMode, NodeExecutionData } from '../../domain/entities/WorkflowExecution';
# To:
#   import { ExecutionStatus, ExecutionMode, NodeExecutionData } from '../../../domain/entities/WorkflowExecution';

# Fix 3: Simplify tsconfig.json
# Remove the "baseUrl" and "paths" section from tsconfig.json
```

## Option 2: Download Fresh Archive

I've updated the archive with these fixes. Download the new `workflow-engine.tar.gz` and extract it.

## Why This Happened

TypeScript path aliases (like `@domain/*`) don't work reliably with `tsx` on Windows. The fix uses relative paths instead, which work everywhere.

## Verify Fix Works

```bash
cd packages/backend
npm run dev
```

You should now see:
```
[INFO] Connecting to database...
[INFO] Database connected successfully
[INFO] Registering nodes...
[INFO] Registered 3 node types
🚀 Server running on port 3000
📝 API available at http://localhost:3000/api
```

## Still Having Issues?

Try:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```
