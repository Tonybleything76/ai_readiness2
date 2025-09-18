# Overview

AI Readiness Assessment is a web application that evaluates organizations' readiness for AI adoption through a comprehensive questionnaire across multiple pillars. The application calculates weighted scores for each pillar and provides an overall readiness score (0-100), presenting results through interactive visualizations including radar charts for pillar breakdown and gauges for overall scores.

The system guides users through a multi-step assessment process, collects organizational information and responses, performs scoring calculations based on configurable weights, and delivers detailed results with interpretations and recommendations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for development tooling
- **Routing**: Wouter for client-side navigation with three main routes (landing, assessment, results)
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React hooks with localStorage for assessment progress persistence
- **Data Fetching**: TanStack Query for server state management and caching
- **Charts**: Recharts for radar charts and custom gauge component for overall scores

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with JSON responses
- **Data Processing**: Service-oriented architecture with QuestionLoader and Scorer services
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with structured error responses
- **Development**: Hot reload with Vite integration in development mode

## Data Storage Solutions
- **Development Storage**: In-memory storage implementation for rapid development
- **Production Ready**: Drizzle ORM configured for PostgreSQL with Neon Database
- **Schema Management**: Shared schema definitions between frontend and backend
- **Data Persistence**: Response records include answers, calculated scores, and metadata

## Scoring Algorithm
- **Normalization**: Response values (1-5) normalized to 0-1 scale using (value-1)/4 formula
- **Weighted Calculation**: Each question has configurable weights with 0.06 default fallback
- **Pillar Scores**: Weighted sum divided by total weights, converted to 0-100 percentage
- **Overall Score**: Simple average of all pillar scores
- **Categorization**: Score ranges mapped to categories with colors and interpretative messages

## External Dependencies

- **Database**: Neon Database (PostgreSQL) via @neondatabase/serverless driver
- **ORM**: Drizzle ORM for database operations and schema management
- **Validation**: Zod for runtime type validation and schema enforcement
- **Charts**: Recharts library for data visualization components
- **UI Framework**: Radix UI primitives for accessible component foundations
- **Development**: Vite for bundling, hot reload, and development server proxy
- **Fonts**: Google Fonts integration (DM Sans, Fira Code, Architects Daughter)
- **Session Management**: Express session handling with PostgreSQL store capability

## Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Configuration**: Separate client and server build processes
- **Path Aliases**: TypeScript path mapping for clean imports
- **Asset Handling**: Vite configuration for static asset processing
- **Development Plugins**: Replit-specific plugins for enhanced development experience