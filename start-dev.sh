#!/bin/bash

# Start both backend and frontend servers concurrently
npx concurrently "tsx watch server/index.ts" "vite --port 5000 --host true"
