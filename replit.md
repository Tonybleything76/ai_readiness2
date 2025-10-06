# AI Readiness Assessment Web Application

## Overview

A comprehensive AI Readiness Assessment web application designed as a diagnostic tool for organizations to evaluate their preparedness for AI implementation. The application provides detailed guidance, scoring, and insights across five critical dimensions of AI readiness.

## Features

### Comprehensive Assessment Framework
- **5 Assessment Dimensions:**
  1. Technology Infrastructure (20% weight)
  2. Data Management & Quality (25% weight - highest priority)
  3. Organizational Culture & Skills (20% weight)
  4. Strategy & Planning (20% weight)
  5. Risk & Compliance (15% weight)

- **4 Readiness Levels:**
  1. Getting Started (0-40%)
  2. Developing (40-60%)
  3. Good Progress (60-80%)
  4. AI Ready (80-100%)

- **20 Total Questions** (4 per dimension) with detailed response options

### Landing Page
- Comprehensive instructions on how to use the assessment
- Complete explanation of scoring methodology with weights
- Detailed overview of each assessment section including:
  - Description of what the section covers
  - Why the section is important
  - What capabilities are being assessed
- Full description of all readiness levels with characteristics
- Visual cards for easy navigation and understanding

### Assessment Flow
- Guided step-by-step experience
- Organization information collection (name and industry)
- Contextual guidance for each section with:
  - Section description
  - Importance explanation
  - Assessment focus details
- Progress tracking
- Clear visual feedback for selected answers
- Question-by-question flow with validation

### Results Page
- Overall AI readiness score (0-100)
- Readiness level badge and classification
- Detailed characteristics of achieved readiness level
- Individual scores for all 5 dimensions
- Per-section readiness levels
- Visual progress bars for scores
- Scoring methodology reminder
- Actions: Download results, Retake assessment, Return home

## Technical Architecture

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query v5 for server state
- **UI Components:** Custom components with Tailwind CSS
- **Styling:** Tailwind CSS with custom theme
- **Build Tool:** Vite

### Backend
- **Framework:** Express.js with TypeScript
- **Storage:** In-memory storage (MemStorage implementation)
- **API Routes:**
  - `GET /api/assessment` - Fetch assessment sections and questions
  - `POST /api/assessment/submit` - Submit assessment and calculate scores
  - `GET /api/results/:id` - Retrieve specific assessment results

### Data Model
- Organization responses stored with:
  - Organization name and industry
  - All question answers
  - Calculated scores (overall + per-section)
  - Readiness level classification
  - Timestamp

### Scoring Logic
- Weighted average calculation across all dimensions
- Data Management receives highest weight (25%) as it's foundational to AI success
- Each answer normalized to 0-100 scale
- Section scores averaged from question responses
- Overall score computed from weighted section scores
- Readiness level determined by score ranges

## Running the Application

### Development
```bash
npm run dev
```
Starts the development server on port 3000 (backend) and Vite dev server.

### Build
```bash
npm run build
```
Builds the production-ready application.

## File Structure

```
├── client/src/
│   ├── components/ui/       # Reusable UI components
│   ├── pages/              # Main application pages
│   │   ├── landing.tsx     # Landing page with instructions
│   │   ├── assessment.tsx  # Assessment flow
│   │   └── results.tsx     # Results display
│   ├── lib/                # Utilities and query client
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── server/
│   ├── routes.ts           # API route handlers
│   ├── storage.ts          # Data storage interface
│   └── index.ts            # Express server setup
├── shared/
│   ├── schema.ts           # Database schema and types
│   └── assessment-data.ts  # Assessment content and logic
└── package.json            # Dependencies and scripts
```

## Assessment Content

### Technology Infrastructure
Evaluates cloud maturity, computational resources, data storage architecture, and API integration capabilities.

### Data Management & Quality
Assesses data quality, accessibility, governance frameworks, and documentation practices.

### Organizational Culture & Skills
Examines leadership support, AI skills availability, learning culture, and change management capabilities.

### Strategy & Planning
Reviews AI strategy documentation, use case identification, roadmap development, and success metrics.

### Risk & Compliance
Evaluates ethics framework, regulatory compliance, security measures, and bias mitigation practices.

## User Experience Highlights

1. **Clear Guidance:** Every section includes explanations of why it matters and what's being assessed
2. **Progressive Disclosure:** Information revealed step-by-step to avoid overwhelming users
3. **Visual Feedback:** Progress bars, colored indicators, and clear navigation
4. **Comprehensive Results:** Not just scores, but actionable insights and context
5. **Educational Content:** Users learn about AI readiness while completing the assessment

## Future Enhancements (Potential)
- Database persistence (currently in-memory)
- PDF report generation
- Historical tracking and progress over time
- Comparison with industry benchmarks
- Detailed recommendations based on scores
- Admin dashboard for viewing all responses

## User Preferences

Preferred communication style: Simple, everyday language.
