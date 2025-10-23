# AI Readiness Assessment

An AI Readiness Web Application for Customers to Complete as a Diagnostic Tool

## Overview

This application helps organizations evaluate their AI readiness across 9 critical dimensions through a comprehensive assessment tool. Users can choose between a free assessment (25 questions) or a full assessment (90 questions), and receive detailed scoring and recommendations.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (optional for local development)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database (optional for local development - will use in-memory storage if not set)
DATABASE_URL=postgresql://user:password@host:port/database

# Analytics (optional - will log to console if not set)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

This runs both the backend server and Vite dev server. The application will be available at the port shown in the console output.

### Production Build

```bash
npm run build
npm start
```

## Database Migrations

The application uses Drizzle ORM for database schema management. Database migrations are handled automatically through Drizzle Kit.

### Local Development

If you're using a local PostgreSQL database, you need to push the schema to your database:

```bash
# Push schema changes to the database
npx drizzle-kit push
```

If you encounter data-loss warnings and want to force the push:

```bash
npx drizzle-kit push --force
```

### Production Deployment (Railway)

**Important**: Before deploying to Railway, ensure these steps are completed:

1. **Set Environment Variables** in your Railway project:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `VITE_GA_MEASUREMENT_ID` - (Optional) Your Google Analytics measurement ID

2. **Add Migration Step** to your build/deploy process:
   ```bash
   # In Railway, configure the build command:
   npm install && npx drizzle-kit push --force && npm run build
   ```

3. **Start Command**:
   ```bash
   node --loader tsx server/index.ts
   ```

### Database Schema

The application uses a single `responses` table to store assessment results:

- `id` - Unique identifier for each assessment
- `org_name` - Organization name
- `industry` - Industry type
- `answers_json` - JSON object of question answers
- `pillar_scores` - JSON object with scores for all 9 dimensions
- `overall` - Overall AI readiness score
- `category` - Readiness level (Getting Started, Developing, Good Progress, AI Ready)
- `assessment_mode` - Type of assessment (free or full)
- `question_count` - Number of questions answered
- `created_at` - Timestamp of submission

## Testing the Result Flow

### Manual Testing Workflow

Follow these steps to test the complete assessment and results flow:

#### 1. Start the Application

```bash
npm run dev
```

#### 2. Complete an Assessment

1. Navigate to `http://localhost:PORT/` (check console for actual port)
2. Click "Start Free Assessment" or "Take Full Assessment"
3. Fill in organization information:
   - Organization Name: `Test Company`
   - Industry: `Technology`
4. Progress through the assessment:
   - Answer questions for each dimension
   - Use the "Next" button to proceed
   - Track your progress via the progress bar
5. Submit the assessment

#### 3. Verify Results Page

After submission, you should be redirected to `/results/{id}`. Verify:

- ✅ Overall AI readiness score displays correctly
- ✅ Readiness level badge shows appropriate category
- ✅ Radar chart visualizes scores across all 9 dimensions
- ✅ Individual dimension scores are displayed
- ✅ Organization info and completion date appear correctly
- ✅ Assessment tier (Free/Full) is shown with question count

#### 4. Test Results Persistence

1. **Reload the page** - Results should persist (no 404 error)
2. **Copy the URL** and open in a new tab - Results should load correctly
3. **Test 404 handling**:
   - Visit `/results/invalid-id-12345`
   - Should display user-friendly error message
   - Should show "Start New Assessment" button linking to `/assessment`

#### 5. Verify API Endpoints

Test the API endpoints directly:

```bash
# Health check (should return { ok: true, env: "development", storage: "db" or "mem" })
curl http://localhost:PORT/api/health

# Get existing result (should return 200 with result data)
curl http://localhost:PORT/api/results/{valid-id}

# Get non-existent result (should return 404 with JSON error)
curl http://localhost:PORT/api/results/invalid-id
```

### Expected Behavior

**Success Case:**
- Submission redirects to `/results/{id}`
- Results page loads with all data displayed
- Page reload maintains results
- Sharing the URL allows others to view results

**404 Error Case:**
- Invalid result ID shows friendly error message
- Error page includes "Start New Assessment" button
- Error page includes "Back to Home" button
- No console errors related to React or API calls

**Network Error Case:**
- Generic error message displayed
- Retry/navigation options provided
- Application remains stable

## Storage Modes

The application automatically detects the environment and uses appropriate storage:

- **Development without DATABASE_URL**: Uses in-memory storage (data lost on restart)
- **Development with DATABASE_URL**: Uses PostgreSQL database
- **Production (Railway)**: Requires DATABASE_URL, uses PostgreSQL database

You can verify which storage mode is active by checking:

```bash
curl http://localhost:PORT/api/health
```

The response includes a `storage` field: `"db"` or `"mem"`

## Key Features

- **Two-Tier Assessment System**: Free (25 questions) and Full (90 questions)
- **9 Dimensions of AI Readiness**: Comprehensive evaluation framework
- **Real-time Progress Tracking**: Save and resume assessments
- **Visual Results**: Radar charts and detailed scoring breakdowns
- **Responsive Design**: Works on desktop and mobile devices
- **Analytics Integration**: Google Analytics 4 support (optional)
- **Export & Share**: Download and share assessment results

## Project Structure

```
.
├── client/              # Frontend React application
│   └── src/
│       ├── pages/      # Page components
│       ├── components/ # Reusable UI components
│       ├── lib/        # Utilities and helpers
│       └── hooks/      # Custom React hooks
├── server/             # Backend Express application
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Database and storage logic
│   └── utils/          # Server utilities
├── shared/             # Shared types and schemas
│   ├── schema.ts       # Database schema (Drizzle)
│   ├── assessment-data.ts  # Assessment configuration
│   └── validation.ts   # Validation schemas (Zod)
└── data/              # Assessment question data
```

## API Endpoints

- `GET /api/assessment?tier=free|full` - Fetch assessment questions
- `POST /api/assessment/submit` - Submit assessment answers
- `GET /api/results/:id` - Retrieve assessment results
- `GET /api/health` - Health check and environment info

## Troubleshooting

### Results Page Shows 404

**Problem**: After submitting an assessment, the results page shows "Result Not Found"

**Solutions**:
1. Verify database is configured correctly (check `DATABASE_URL`)
2. Ensure migrations have been run (`npx drizzle-kit push`)
3. Check server logs for database errors
4. Verify the `responses` table exists in your database

### Assessment Progress Not Saving

**Problem**: Progress is lost when refreshing during assessment

**Solution**: Progress is saved in localStorage. Check that:
1. Browser allows localStorage
2. You're using the same browser/device
3. You haven't cleared browser data

### Build Fails on Railway

**Problem**: Deployment fails with database or migration errors

**Solutions**:
1. Ensure `DATABASE_URL` is set in Railway environment variables
2. Add migration step to build command: `npx drizzle-kit push --force && npm run build`
3. Verify drizzle.config.ts is correctly configured
4. Check Railway logs for specific error messages

## Support

For issues, questions, or contributions, please refer to the contact form in the application or reach out to the development team.
