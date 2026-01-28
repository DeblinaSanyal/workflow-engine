#!/bin/bash

# Get the original files from git to restore them
cd /Users/I565665/POC/workflow-engine/packages/frontend/src/components

# Check if these files exist in git history
git checkout HEAD -- AddNodeMenu.tsx PlusButtonEdge.tsx 2>/dev/null || echo "Files not in git, will create new ones"

echo "Files restored from git (if they existed)"
