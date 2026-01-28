# Quick Visual Setup Guide

## What You're About to Do

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                              │
│  Terminal 1              Terminal 2           Browser       │
│  ┌──────────┐           ┌──────────┐         ┌──────────┐  │
│  │ Backend  │           │ Frontend │         │  Visual  │  │
│  │ Server   │◄─────────►│  React   │◄───────►│  Editor  │  │
│  │ :3000    │   API     │  :5173   │  HTTP   │          │  │
│  └──────────┘           └──────────┘         └──────────┘  │
│       │                                                      │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────┐                                               │
│  │ In-Memory│  ← No database needed!                        │
│  │ Storage  │                                               │
│  └──────────┘                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Simple 3-Step Process

### STEP 1: Start Backend (Terminal 1)
```bash
cd packages/backend
npm install          # First time only
npm run dev:no-db    # Start server
```

Wait for:
```
🚀 Workflow Engine Server Ready!
📝 API: http://localhost:3000/api
```

### STEP 2: Start Frontend (Terminal 2)
```bash
cd packages/frontend
npm install      # First time only
npm run dev      # Start frontend
```

Wait for:
```
➜ Local: http://localhost:5173/
```

### STEP 3: Open Browser
Go to: **http://localhost:5173**

You'll see:
```
┌────────────────────────────────────────────────┐
│  Workflows                    [+ New Workflow] │
├────────────────────────────────────────────────┤
│                                                 │
│  No workflows yet                              │
│  Get started by creating your first workflow   │
│                                                 │
│            [Create Workflow]                    │
│                                                 │
└────────────────────────────────────────────────┘
```

## Building Your First Workflow

### Visual Editor Layout
```
┌────────────────────────────────────────────────────────────────┐
│  Workflow Name            [Save] [Execute]          ← Toolbar  │
├──────────────┬──────────────────────────────┬─────────────────┤
│              │                               │                 │
│  NODE        │       CANVAS                 │   PROPERTIES    │
│  PALETTE     │                               │                 │
│              │  ┌──────────┐                │                 │
│ 🌐 HTTP      │  │  Node 1  │──┐             │  Selected Node  │
│              │  └──────────┘  │             │  Configuration  │
│ 🔄 Transform │                ▼             │                 │
│              │  ┌──────────┐                │  Parameters:    │
│ 🔀 Condition │  │  Node 2  │                │  - URL          │
│              │  └──────────┘                │  - Method       │
│              │                               │  - Headers      │
│              │  Drag nodes here →           │                 │
│              │                               │                 │
├──────────────┴──────────────────────────────┴─────────────────┤
│  Status: Ready                                                  │
└────────────────────────────────────────────────────────────────┘
```

### How to Use

1. **Drag** nodes from left panel
2. **Drop** onto canvas (middle area)
3. **Connect** nodes by dragging blue dot → gray dot
4. **Click** node to configure (right panel opens)
5. **Fill** required parameters (marked with *)
6. **Save** workflow (top toolbar)
7. **Execute** to run it!

## Example Workflow

```
Start Here
    ↓
┌────────────────────┐
│  HTTP Request      │  ← Fetch data from API
│  GET /users/github │
└────────────────────┘
    ↓ (data flows down)
┌────────────────────┐
│  Data Transform    │  ← Extract specific fields
│  return {          │
│    name: input.name│
│  }                 │
└────────────────────┘
    ↓
Result: { name: "GitHub" }
```

## Troubleshooting Visual

```
Problem: Can't see nodes in palette
    ↓
Check: Is backend running?
    ↓
Terminal 1 should show:
    "🚀 Workflow Engine Server Ready!"
    ↓
    If not → Run: npm run dev:no-db
    
─────────────────────────────────────

Problem: Connection error
    ↓
Check: Are both servers running?
    ↓
Terminal 1: Backend (port 3000)
Terminal 2: Frontend (port 5173)
    ↓
    If ports in use → Kill processes
    
─────────────────────────────────────

Problem: Workflow won't save
    ↓
Check: Did you click "Save" button?
    ↓
Look for button in top toolbar
Click explicitly (not auto-saved)
```

## What You Can Build

```
API Integration           Data Processing          Multi-Step Logic
─────────────            ─────────────            ─────────────
HTTP → Transform         HTTP → Transform         HTTP → Condition
                              → Transform             ├─ True → HTTP
                              → Transform             └─ False → HTTP

Webhook Handler          ETL Pipeline             Notification System
─────────────            ─────────────            ─────────────
HTTP → Condition         HTTP → Transform         HTTP → Condition
    → HTTP                    → Transform             → HTTP (email)
                              → HTTP                  → HTTP (slack)
```

## Keyboard Shortcuts (When Available)

- **Delete Node**: Select node → Press Delete
- **Save**: Ctrl/Cmd + S (if implemented)
- **Zoom**: Mouse wheel on canvas
- **Pan**: Click and drag canvas background

## Next Steps

1. ✅ Get it running (follow steps above)
2. ✅ Build a simple workflow
3. ✅ Try all 3 node types
4. 📚 Read QUICK_START_NO_DB.md for examples
5. 🚀 Add custom nodes (see README.md)
6. 💾 Set up PostgreSQL (see GETTING_STARTED.md)

## Support

Stuck? Check these files:
- **QUICK_START_NO_DB.md** ← Detailed walkthrough
- **QUICK_FIX.md** ← Common errors
- **README.md** ← Full documentation

## Ready? Let's Go! 🚀

Open 2 terminals, run the commands above, and start building!
