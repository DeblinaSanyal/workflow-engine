# Quick Start - No Database Required! 🚀

Run the entire workflow platform in **2 minutes** without setting up PostgreSQL.

## What You'll Get

- ✅ Visual workflow editor
- ✅ Drag-and-drop nodes
- ✅ Save and execute workflows
- ✅ All 3 node types working
- ❌ Data persists only in memory (resets on restart)

Perfect for:
- Quick demo
- Learning the system
- Testing node development
- Frontend development

## Step 1: Install Dependencies (One-Time)

```bash
# Extract the archive if you haven't
tar -xzf workflow-engine.tar.gz
cd workflow-engine

# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

cd ../..
```

## Step 2: Start Backend (No Database!)

Open **Terminal 1**:

```bash
cd packages/backend
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
💡 Note: All data is stored in memory and will be lost on restart
============================================================
```

✅ **Backend is running!**

## Step 3: Start Frontend

Open **Terminal 2**:

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

✅ **Frontend is running!**

## Step 4: Open Browser & Build Workflows!

Open: **http://localhost:5173**

### Creating Your First Workflow

1. **Click "New Workflow"**
   - Opens the visual editor
   
2. **Drag Nodes from Left Panel**
   - Look for the node palette on the left
   - Try dragging "HTTP Request" onto the canvas
   - Drag "Data Transform" onto the canvas
   - Drag "If Condition" onto the canvas

3. **Connect Nodes**
   - Click and drag from the **blue dot** (output) on the right of one node
   - Connect to the **gray dot** (input) on the left of another node
   - Example: HTTP Request → Data Transform → If Condition

4. **Configure Nodes**
   - Click on any node to select it
   - Right panel shows configuration options
   - Fill in the parameters

5. **Save Your Workflow**
   - Click "Save New" in the top toolbar
   - Give it a name (e.g., "My First Workflow")

6. **Execute Workflow**
   - Click "Execute" button
   - Watch it run!
   - View results

## Example: Simple Working Workflow

### HTTP Request Node
1. Drag "HTTP Request" onto canvas
2. Click to configure:
   - **Method**: GET
   - **URL**: `https://api.github.com/users/github`
   - **Headers**: `{}` (leave empty)
   - **Timeout**: 30000

### Data Transform Node
1. Drag "Data Transform" next to HTTP Request
2. Connect HTTP Request output → Data Transform input
3. Click Data Transform to configure:
   - **Code**: 
   ```javascript
   return {
     name: input.body.name,
     followers: input.body.followers,
     repos: input.body.public_repos
   }
   ```

### Save & Run
1. Click "Save New"
2. Name: "GitHub User Info"
3. Click "Execute"
4. 🎉 See the result!

## Available Nodes

### 1. HTTP Request 🌐
Make HTTP calls to any API

**Use cases:**
- Fetch data from APIs
- Send webhooks
- Call external services

**Parameters:**
- Method (GET, POST, PUT, PATCH, DELETE)
- URL
- Headers (JSON)
- Body (JSON for POST/PUT/PATCH)
- Timeout

### 2. Data Transform 🔄
Transform data using JavaScript

**Use cases:**
- Map/filter/reduce data
- Extract specific fields
- Format data for next node
- Calculate values

**Parameters:**
- JavaScript Code (input variable contains previous node's data)

**Example:**
```javascript
// Extract and transform
return {
  firstName: input.body.name.split(' ')[0],
  total: input.items.reduce((sum, item) => sum + item.price, 0)
}
```

### 3. If Condition 🔀
Route workflow based on conditions

**Use cases:**
- Branch logic
- Filter data
- Conditional execution

**Parameters:**
- Condition (JavaScript expression returning true/false)

**Examples:**
```javascript
// Check value
input.value > 100

// Check existence
input.email && input.email.includes('@')

// Complex condition
input.status === 'active' && input.credits > 0
```

## Tips & Tricks

### Node Connection
- **Blue dots** = Outputs (right side)
- **Gray dots** = Inputs (left side)
- Drag from output → input to connect

### Node Configuration
- Click any node to see its properties
- **Red asterisk (*)** = required field
- Changes save automatically when you click "Save"

### Accessing Previous Node Data
In Data Transform or Conditional nodes:
```javascript
// Current input
input.someField

// Get data from specific previous node
context.getPreviousNodeData('node-id-here')
```

### Debugging
- Check browser console (F12) for errors
- Backend logs show in Terminal 1
- Each node execution is logged

### Testing Individual Nodes
1. Create single-node workflow
2. Configure parameters
3. Execute
4. Check result
5. Then chain nodes together

## Common Patterns

### API → Transform → API
```
HTTP Request (fetch data)
    ↓
Data Transform (format)
    ↓
HTTP Request (send to another API)
```

### API → Condition → Different Actions
```
HTTP Request (get status)
    ↓
If Condition (check status)
    ├─ True → HTTP Request (success action)
    └─ False → HTTP Request (error action)
```

### Multiple Transforms
```
HTTP Request (fetch)
    ↓
Data Transform (extract)
    ↓
Data Transform (calculate)
    ↓
Data Transform (format)
```

## Stopping the Servers

### Stop Backend
In Terminal 1: Press `Ctrl + C`

### Stop Frontend
In Terminal 2: Press `Ctrl + C`

## Data Persistence Note ⚠️

Since we're using **in-memory storage**:
- ✅ Everything works perfectly
- ✅ Can create, save, execute workflows
- ❌ Data disappears when you restart the server
- ❌ No permanent storage

For production with PostgreSQL, see: **GETTING_STARTED.md**

## Troubleshooting

### Port Already in Use
```bash
# Backend (port 3000)
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it

# Frontend (port 5173)
lsof -i :5173
kill -9 <PID>
```

### Can't See Nodes in Palette
- Make sure backend is running (`npm run dev:no-db`)
- Check browser console for errors
- Refresh the page

### Workflow Won't Execute
- Check that all required parameters (marked with *) are filled
- Look at backend logs in Terminal 1
- Verify nodes are connected properly

### Changes Not Saving
- Click the "Save New" or "Save" button explicitly
- Don't just rely on auto-save

## What's Next?

### Ready for More?
1. **Add Custom Nodes**: See README.md section "Adding Custom Nodes"
2. **Set Up PostgreSQL**: Follow GETTING_STARTED.md for persistent storage
3. **Deploy to Production**: See README.md deployment section

### Learn the Architecture
- **README.md**: Deep dive into architecture
- **Code Comments**: Inline documentation
- **PROJECT_SUMMARY.md**: Overview and design decisions

## Video Tutorial (Conceptual)

1. **Start servers** (both terminals)
2. **Open browser** (http://localhost:5173)
3. **Click "New Workflow"**
4. **Drag HTTP Request** onto canvas
5. **Click node** to configure
6. **Fill in URL**: `https://api.github.com/users/github`
7. **Click "Save New"**
8. **Name it**: "GitHub Test"
9. **Click "Execute"**
10. **See results** in execution view

## Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can see workflow editor
- [ ] Can drag nodes onto canvas
- [ ] Can connect nodes
- [ ] Can configure node parameters
- [ ] Can save workflow
- [ ] Can execute workflow
- [ ] Can see execution results

## You're Ready! 🎉

You now have a fully functional workflow automation platform running **without any database setup**!

Start building workflows and experiment with different node combinations. When you're ready for production, set up PostgreSQL following the full GETTING_STARTED.md guide.

Happy automating! 🚀
