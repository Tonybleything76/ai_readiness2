# AI Readiness Assessment Web Application

## Overview

A comprehensive AI Readiness Assessment web application designed as a diagnostic tool for organizations to evaluate their preparedness for AI implementation. The application offers **two assessment tiers** to accommodate different organizational needs and time commitments, providing detailed guidance, scoring, and insights across nine strategic dimensions of AI readiness.

## Features

### Two-Tier Assessment System
- **Free Tier:** 25 questions (~10 minutes) - Quick diagnostic assessment
- **Full Tier:** 90 questions (~30 minutes) - Comprehensive evaluation
- Both tiers cover all 9 strategic dimensions with proportional question distribution

### Assessment Framework
- **9 Strategic Dimensions:**
  1. Strategic Leadership (10% weight)
  2. Use Case Portfolio (10% weight)
  3. Data Foundation (15% weight - highest priority)
  4. Technology Infrastructure (12% weight)
  5. Governance & Risk (12% weight)
  6. Responsible AI (12% weight)
  7. People & Skills (12% weight)
  8. Change Management (10% weight)
  9. Value Realization (7% weight)

- **4 Readiness Levels:**
  1. Getting Started (0-40%)
  2. Developing (40-60%)
  3. Good Progress (60-80%)
  4. AI Ready (80-100%)

### Global Navigation & Footer (NEW - Phase 1)
- **Persistent Navigation Bar:**
  - Sticky header with brand logo
  - Desktop: Horizontal menu with all navigation links
  - Mobile: Responsive hamburger menu
  - Links: Home, Free Assessment, Full Assessment, Pricing, How It Works, Outcomes, Contact
  - "Get Started" CTA button (links to full assessment)
  - Active link highlighting based on current route
  - Keyboard accessible with focus states
  
- **Global Footer:**
  - Brand section with logo and description
  - Product links (Free Assessment, Full Assessment, Pricing, How It Works)
  - Company links (Outcomes, Contact)
  - Social media icons (LinkedIn, Twitter, Email)
  - Copyright information

### Landing Page
- **Sales-focused design** with clear value proposition
- Two primary CTAs: "Take the Free Assessment Now" and "Try Full Assessment (90 Questions)"
- **9-dimension methodology framework** displayed on landing page as "Our Comprehensive 9-Dimension Framework" section
- Direct access to both free and full assessments from main CTAs
- Links to Full Assessment Overview page and Pricing page
- Professional branding and messaging

### Full Assessment Overview Page (/overview)
- Comprehensive value proposition for the full assessment
- Feature highlights and assessment benefits
- Optional add-ons (consulting, custom recommendations, etc.)
- Consultation request form (name, email, organization, message)
- Contact information (email and phone)

### Pricing Page (/pricing)
- Pricing tiers for full assessment
- Feature comparison between Free and Full tiers
- **Direct access to Full Assessment** - "Start Full Assessment" button available (no payment required)
- Enterprise and custom solutions section
- FAQ section addressing common questions
- Note: Payment integration planned for future release

### How It Works Page (/how-it-works) (NEW - Phase 1)
- Step-by-step assessment process explanation
- 4 main steps with duration estimates
- 9 dimensions overview section
- "What You'll Receive" highlights
- CTAs to start free or full assessment

### Outcomes Page (/outcomes) (NEW - Phase 1)
- Business outcomes and benefits showcase
- 6 key business outcomes with icons
- Success stories from different industries
- Key benefits checklist
- ROI statistics section
- CTAs to start assessment

### Contact Page (/contact) (NEW - Phase 1)
- Contact form (name, email, company, phone, message)
- Contact methods: Email, Phone, Address
- Quick action buttons (Start Assessment, Schedule Consultation, View Pricing)
- FAQ section

### Scheduling & Consultation (NEW - Phase 4)
- **Schedule Page (/schedule):**
  - Embedded Calendly widget for booking consultations
  - What to expect section with expert guidance, personalized insights, and action roadmap
  - Session details explaining the post-booking process
  - Automatic redirect to confirmation page after successful booking
  
- **Confirmation Page (/confirmation):**
  - Success confirmation with visual feedback
  - Next steps information (email, assessment review, consultation session, follow-up)
  - Preparation tips for the consultation
  - Rescheduling information and support contact
  
- **Calendly Configuration:**
  - Configurable URL in `client/src/config/calendly.ts`
  - Default placeholder URL that should be replaced with actual Calendly link
  - Message event listener for automatic navigation to confirmation
  
- **Integration Points:**
  - Results page includes "Schedule Consultation" CTA after assessment completion
  - Pricing page offers scheduling for enterprise solutions
  - Contact page updated to link to internal scheduling flow

### Assessment Flow
- Guided step-by-step experience
- Organization information collection (name and industry)
- **Dimension overviews:** Displayed once at the start of each dimension section
  - Overview includes: dimension name, description, importance, and focus
  - "Next" button to proceed from overview to questions
- Progress tracking across all dimensions
- Clear visual feedback for selected answers
- **Validation:** All questions in a dimension must be answered before proceeding
- Question-by-question flow within each dimension

### Results Page
- Overall AI readiness score (0-100)
- Readiness level badge and classification
- Detailed characteristics of achieved readiness level
- Individual scores for all 9 dimensions
- Per-dimension readiness levels
- Visual progress bars for scores
- Tier information displayed (Free 25Q or Full 90Q)
- Actions: Retake assessment, Return home

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
- **Storage:** PostgreSQL database with Drizzle ORM
- **Question Loading:** Dynamic tier-based loading from JSON files
  - `data/ai_readiness_free_25.json` - Free tier (25 questions across 9 dimensions)
  - `data/ai_readiness_full_90.json` - Full tier (90 questions, 10 per dimension)
  - `data/dimension_overviews.json` - Dimension overview content
- **API Routes:**
  - `GET /api/assessment?tier=free|full` - Fetch tier-specific questions + dimension overviews
  - `POST /api/assessment/submit` - Submit assessment with tier metadata
  - `GET /api/results/:id` - Retrieve specific assessment results

### Data Model
- Organization responses stored with:
  - Organization name and industry
  - All question answers (JSONB)
  - **Calculated scores for 9 dimensions:**
    - strategicLeadership
    - useCasePortfolio
    - dataFoundation
    - techInfrastructure
    - governanceRisk
    - responsibleAI
    - peopleSkills
    - changeManagement
    - valueRealization
  - Overall score (0-100)
  - Readiness level classification
  - **Assessment tier:** assessmentMode (free/full) and questionCount (25/90)
  - Timestamp

### Tier System Implementation
- **Backend Validation:** Ensures assessmentMode matches questionCount (free=25, full=90)
- **Dynamic Scoring:** Tier-specific question distribution
  - Free: 3,3,3,3,3,3,2,3,2 questions per dimension = 25 total
  - Full: 10 questions per dimension = 90 total
- **Backward Compatibility:** pillarScores is JSONB allowing flexible structure
- **Type Safety:** All tier parameters properly typed across frontend and backend

### Scoring Logic
- Weighted average calculation across 9 dimensions
- Data Foundation receives highest weight (15%) as foundational to AI success
- Strategic Leadership & Use Case Portfolio: 10% each
- Tech Infrastructure, Governance, Responsible AI, People & Skills, Change Mgmt: 12% each
- Value Realization: 7% (lowest weight)
- Each answer normalized to 0-100 scale
- Dimension scores averaged from question responses
- Overall score computed from weighted dimension scores
- Readiness level determined by score ranges (0-40%, 40-60%, 60-80%, 80-100%)

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
│   │   ├── landing.tsx     # Landing page with tier selection
│   │   ├── overview.tsx    # Full assessment overview page
│   │   ├── pricing.tsx     # Pricing page
│   │   ├── assessment.tsx  # Tier-aware assessment flow
│   │   └── results.tsx     # Results display with tier info
│   ├── lib/                # Utilities and query client
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Application entry point
├── server/
│   ├── routes.ts           # API route handlers with tier support
│   ├── storage.ts          # Data storage interface
│   ├── utils/
│   │   └── questionLoader.ts  # Tier-based question loading
│   └── index.ts            # Express server setup
├── shared/
│   ├── schema.ts           # Database schema with tier fields
│   └── assessment-data.ts  # Assessment content and scoring logic
├── data/
│   ├── ai_readiness_free_25.json   # Free tier questions
│   ├── ai_readiness_full_90.json   # Full tier questions
│   └── dimension_overviews.json    # Dimension overview content
└── package.json            # Dependencies and scripts
```

## Assessment Content

### 9 Strategic Dimensions

1. **Strategic Leadership** - Evaluates executive sponsorship, vision alignment, and organizational commitment to AI transformation
2. **Use Case Portfolio** - Assesses identified use cases, prioritization methodology, and value realization planning
3. **Data Foundation** - Reviews data quality, accessibility, governance, and readiness for AI applications (highest weight: 15%)
4. **Technology Infrastructure** - Examines cloud maturity, computational resources, and technical architecture
5. **Governance & Risk** - Evaluates risk management frameworks, compliance, and decision-making processes
6. **Responsible AI** - Assesses ethical AI practices, bias mitigation, and responsible development principles
7. **People & Skills** - Reviews talent capabilities, training programs, and organizational skills readiness
8. **Change Management** - Examines change readiness, communication strategies, and adoption planning
9. **Value Realization** - Evaluates metrics, ROI tracking, and business value measurement approaches

## User Experience Highlights

1. **Clear Guidance:** Every section includes explanations of why it matters and what's being assessed
2. **Progressive Disclosure:** Information revealed step-by-step to avoid overwhelming users
3. **Visual Feedback:** Progress bars, colored indicators, and clear navigation
4. **Comprehensive Results:** Not just scores, but actionable insights and context
5. **Educational Content:** Users learn about AI readiness while completing the assessment

## Future Enhancements (Potential)
- PDF report generation
- Historical tracking and progress over time
- Comparison with industry benchmarks
- Detailed recommendations based on scores
- Admin dashboard for viewing all responses

## User Preferences

Preferred communication style: Simple, everyday language.
