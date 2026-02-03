# Plus Button Edge Feature - Testing Guide

## 🎉 What's New

Your workflow editor now has **plus buttons on ALL edges** that allow you to quickly add nodes!

## 🖥️ Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend** (Mock API): http://localhost:3000

## 🔍 What to Look For

### 1. **Blue Plus Buttons** (Pending Edges)
These appear automatically when you add a node:

- **When**: After dragging a node onto the canvas
- **Where**: At the end of each output handle from the node
- **Appearance**: 
  - Animated dashed blue line
  - Large blue circular plus button at the end
  - Pulses gently
- **Purpose**: Add the next node in your workflow sequence

**How to test:**
1. Open http://localhost:5173
2. Drag any node from the left palette onto the canvas
3. You'll immediately see blue plus buttons extending from the node
4. Click a plus button → searchable menu appears
5. Select a node → it gets added and connected automatically

### 2. **Green Plus Buttons** (Regular Edges) - NEW! ✨
These appear on connections between nodes:

- **When**: After connecting two nodes together
- **Where**: At the midpoint of the edge connecting two nodes
- **Appearance**:
  - Green circular plus button
  - Smaller than blue buttons
  - Hover to see scale effect
- **Purpose**: Insert a node BETWEEN two connected nodes

**How to test:**
1. Drag a node onto the canvas (e.g., "HTTP Request")
2. Click the blue plus button to add another node (e.g., "Data Transform")
3. Now there's a solid edge connecting them
4. **Look at the middle of that edge** → you'll see a GREEN plus button
5. Click it → searchable menu appears
6. Select a node → it gets inserted BETWEEN the two nodes

## 🎯 Key Features

### Automatic Workflow Building
- Every new node automatically creates "pending edges" with plus buttons
- Makes it easy to build workflows sequentially
- No need to manually drag connections

### Node Insertion
- Click green plus button on any edge
- Insert nodes between existing connections
- Original edge is replaced with two new edges
- Perfect for adding transform or conditional nodes mid-flow

### Smart Connection
- When inserting a node, it automatically:
  - Removes the old edge
  - Connects source → new node → target
  - Uses the correct input/output handles
  - Creates pending edges for any additional outputs

### Searchable Node Menu
- Press arrow keys to navigate
- Press Enter to select
- Press Escape to close
- Filter by name, category, or description
- Favorite nodes appear at the top (click star icon)

## 🎨 Visual Differences

| Feature | Color | Style | Location |
|---------|-------|-------|----------|
| Pending Edge | Blue | Dashed, animated | From node output to empty space |
| Regular Edge | Green | Solid | Between two connected nodes |
| Plus Button (Pending) | Blue | Large, pulsing | End of pending edge |
| Plus Button (Regular) | Green | Medium, hover effect | Midpoint of regular edge |

## 🧪 Testing Scenarios

### Scenario 1: Sequential Workflow
1. Drag "HTTP Request" node
2. Click blue plus → add "Data Transform"
3. Click blue plus → add "Send Email"
Result: Linear workflow with 3 nodes

### Scenario 2: Insert Transform Node
1. Create workflow: HTTP Request → Send Email
2. Click green plus button on the edge between them
3. Add "Data Transform" node
Result: HTTP Request → Data Transform → Send Email

### Scenario 3: Branch with Conditional
1. Drag "HTTP Request" node
2. Click blue plus → add "Conditional"
3. Notice: Conditional has TWO outputs (true/false)
4. Two blue plus buttons appear (one for each output)
5. Click first plus → add "Send Email" (true path)
6. Click second plus → add "Slack Message" (false path)
Result: Branching workflow

### Scenario 4: Multiple Outputs
1. Add any node with multiple outputs
2. Each output gets its own pending edge with plus button
3. Build parallel paths easily

## 🐛 Troubleshooting

### "I don't see the plus buttons"
- Make sure both servers are running (frontend on :5173, backend on :3000)
- Hard refresh the browser (Cmd+Shift+R or Ctrl+Shift+F5)
- Check browser console for errors (F12)

### "The green plus buttons aren't showing"
- Make sure you've connected two nodes first
- The button appears at the midpoint of the edge
- Try hovering over the edge to see it better

### "Mock API not working"
- Check if port 3000 is available: `lsof -i:3000`
- Restart the mock server: `node mock-server.js`

### "Frontend not loading"
- Check if port 5173 is available: `lsof -i:5173`
- Restart frontend: `cd packages/frontend && npm run dev`

## 📁 Files Changed

### Created:
- `packages/frontend/src/components/RegularPlusButtonEdge.tsx` - Green plus button component for regular edges

### Modified:
- `packages/frontend/src/stores/workflowStore.ts` - Added `insertNodeOnEdge()` function
- `packages/frontend/src/components/WorkflowEditor.tsx` - Registered new edge type and handlers

### Build Status:
✅ TypeScript compilation: Success
✅ Frontend build: Success
✅ No errors

## 🎬 Quick Start

```bash
# If servers aren't running:

# Terminal 1 - Mock API
cd /Users/I565665/POC/workflow-engine
node mock-server.js

# Terminal 2 - Frontend
cd /Users/I565665/POC/workflow-engine/packages/frontend
npm run dev

# Open browser
open http://localhost:5173
```

## 💡 Tips

1. **Use keyboard shortcuts**: Arrow keys navigate the add node menu
2. **Favorite frequent nodes**: Click the star icon to add to favorites
3. **Search is powerful**: Type to filter nodes by name, category, or description
4. **Plus buttons stack**: You can have multiple pending edges from one node
5. **Undo works**: Cmd/Ctrl+Z to undo node additions

---

Enjoy building workflows faster with plus button edges! 🚀
