# AI Readiness Assessment Web Application

## Overview
The AI Readiness Assessment web application is a diagnostic tool for organizations to evaluate their preparedness for AI implementation. It offers two assessment tiers (Free 25-question and Full 90-question) across nine strategic dimensions of AI readiness, providing scoring, insights, and guidance. The project aims to help organizations understand their AI maturity, identify areas for improvement, and accelerate their AI transformation with a sales-focused design and comprehensive result analysis.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design:** Sales-focused landing page with clear CTAs.
- **Navigation:** Persistent sticky header with brand logo, desktop horizontal menu, responsive mobile hamburger menu, "Get Started" CTA button. Global footer with brand, product, company links, social media, and copyright.
- **Visuals:** Clear guidance, progressive disclosure, visual feedback (progress bars, colored indicators), comprehensive results with actionable insights.
- **Branding:** Professional branding and messaging throughout.

### Technical Implementations
- **Frontend:** React 18 with TypeScript, Wouter for routing, TanStack Query v5 for state management, Tailwind CSS for styling, Vite for building.
- **Backend:** Express.js with TypeScript, PostgreSQL database with Drizzle ORM.
- **Assessment Content:** Questions and dimension overviews loaded dynamically from JSON files (`data/ai_readiness_free_25.json`, `data/ai_readiness_full_90.json`, `data/dimension_overviews.json`).
- **Scoring Logic:** Weighted average calculation across 9 dimensions (Data Foundation highest weight at 15%), with each answer normalized to a 0-100 scale. Readiness levels are categorized as Getting Started (0-40%), Developing (40-60%), Good Progress (60-80%), and AI Ready (80-100%).
- **A/B Testing:** Implemented for the landing page hero section with variants A and B, controlled by `VITE_AB_TEST_VARIANT` environment variable or random 50/50 assignment. Consistent variant per user via localStorage.
- **API Endpoints:**
    - `GET /api/assessment?tier=free|full`: Fetch questions and dimension overviews.
    - `POST /api/assessment/submit`: Submit assessment.
    - `GET /api/results/:id`: Retrieve specific assessment results.

### Feature Specifications
- **Two-Tier Assessment System:** Free (25 questions, ~10 min) and Full (90 questions, ~30 min), both covering 9 strategic dimensions.
- **Strategic Dimensions:** Strategic Leadership, Use Case Portfolio, Data Foundation, Technology Infrastructure, Governance & Risk, Responsible AI, People & Skills, Change Management, Value Realization.
- **Pages:** Landing Page, Full Assessment Overview (`/overview`), Pricing (`/pricing`), How It Works (`/how-it-works`), Outcomes (`/outcomes`), Contact (`/contact`), Schedule (`/schedule`), Confirmation (`/confirmation`), Assessment Flow (`/assessment`), Results Page (`/results`).
- **Assessment Flow:** Guided step-by-step experience, organization info collection, dimension overviews, progress tracking, validation, visual feedback.
- **Results Page:** Overall AI readiness score, readiness level, detailed characteristics, individual dimension scores, visual progress bars, tier information, actions (retake, home).
- **Consultation Scheduling:** Embedded Calendly widget on `/schedule` page, with automatic redirect to a confirmation page. Integrated with results page, pricing page, and contact page.

### System Design Choices
- **Data Model:** Stores organization name, industry, all question answers (JSONB), calculated scores for 9 dimensions, overall score, readiness level, assessment mode (free/full), question count, and timestamp.
- **Tier System:** Backend validation ensures `assessmentMode` matches `questionCount`. Dynamic scoring based on tier-specific question distribution.
- **Analytics & Tracking:** Google Analytics 4 integration (optional via `VITE_GA_MEASUREMENT_ID`), cookie consent banner with opt-in/opt-out, IP anonymization, comprehensive event tracking for CTAs, assessment events, page views, and A/B test exposure.

## External Dependencies
- **PostgreSQL:** Primary database for storing assessment results and related data.
- **Drizzle ORM:** Used for interacting with the PostgreSQL database from the backend.
- **Calendly:** Embedded for scheduling consultation appointments.
- **Google Analytics 4:** For website analytics and tracking user interactions (optional, configured via `VITE_GA_MEASUREMENT_ID`).

## Recent Changes (October 23, 2025)
### React Error Fixes
- **Fixed duplicate script loading:** Added module-level flags (`gaInitialized`, `calendlyScriptLoaded`) to prevent Google Analytics and Calendly scripts from loading multiple times during React StrictMode double-invocation.
- **Improved error handling:** Wrapped script injection code in try-catch blocks to prevent uncaught errors.
- **Added Error Boundary:** Created `ErrorBoundary` component that catches React errors and displays a friendly fallback UI instead of crashing the entire app. Uses `import.meta.env.DEV` for Vite compatibility.
- **Enhanced robustness:** Added `typeof window` checks in analytics and Calendly initialization to prevent issues in non-browser environments.