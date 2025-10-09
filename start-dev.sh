#!/bin/bash

# Start both backend and frontend servers concurrently
# Allow Replit domains via Vite environment variable
export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=".replit.dev,.repl.co"
npx concurrently "tsx watch server/index.ts" "vite --port 5000 --host 0.0.0.0"
