#!/bin/bash

# Start both backend and frontend servers concurrently
# Allow all Replit domains for testing
npx concurrently "tsx watch server/index.ts" "vite --port 5000 --host 0.0.0.0 --server.allowedHosts='*'"
