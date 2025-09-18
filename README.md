# AI Readiness Assessment Tool

A comprehensive web application for evaluating organizations' readiness for AI adoption across multiple assessment pillars including technology infrastructure, data management, organizational culture, strategic planning, and risk management.

## Features

### Phase 1: Core Assessment Platform ✅
- **Multi-pillar Assessment**: Comprehensive evaluation across 5 key areas
- **Interactive Questionnaire**: Step-by-step guided assessment with progress tracking
- **Real-time Scoring**: Immediate calculation of pillar scores and overall readiness
- **Visual Results**: Professional radar charts and gauge displays
- **Detailed Insights**: Contextual explanations and recommendations

### Phase 2: UX Enhancements ✅
- **Progress Tracking**: Visual progress bars and step indicators
- **Auto-save**: Automatic preservation of assessment progress
- **Smooth Transitions**: Animated transitions between assessment steps
- **PDF Export**: Professional PDF generation of assessment results
- **Mobile Responsive**: Optimized charts and interface for mobile devices
- **Results Metadata**: Display of organization info, industry, and timestamp

### Phase 2: Admin Dashboard ✅
- **Secure Admin Access**: Password-protected admin authentication
- **Response Management**: View and manage all assessment responses
- **Data Export**: CSV export of all responses and JSON export of individual responses
- **Pagination**: Efficient handling of large datasets
- **Statistics Dashboard**: Overview of total responses and average scores

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express, TypeScript
- **Database**: In-memory storage (development), SQLite with Prisma (future production)
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter for client-side routing
- **Validation**: Drizzle-Zod for schema validation

## Getting Started

### Prerequisites
- Node.js 18+ 
- No external database required (uses in-memory storage)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - `ADMIN_PASS`: Secure password for admin dashboard access (configured in Replit Secrets)

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000` (or your Replit domain).

## Usage

### Taking an Assessment

1. **Start Assessment**: Navigate to the home page and click "Start Assessment"
2. **Organization Info**: Enter your organization name and industry (optional)
3. **Complete Questionnaire**: Answer questions across all 5 assessment pillars
4. **View Results**: Review your comprehensive readiness report
5. **Export PDF**: Download a professional PDF summary of your results

### Admin Dashboard

1. **Access Admin Panel**: Navigate to `/admin/login`
2. **Login**: Enter the admin password (configured in ADMIN_PASS)
3. **View Responses**: Browse all assessment submissions with pagination
4. **Export Data**: 
   - Download CSV of all responses with comprehensive data
   - Export individual responses as JSON files
5. **Manage Data**: View detailed statistics and response metadata

## Assessment Pillars

### 1. Technology Infrastructure
Evaluates current technology capabilities, data infrastructure, and integration readiness.

### 2. Data Management
Assesses data quality, governance, accessibility, and analytical capabilities.

### 3. Organizational Culture
Reviews AI understanding, change readiness, and digital transformation mindset.

### 4. Strategic Planning
Examines AI strategy integration, goal alignment, and success metrics.

### 5. Risk Management
Analyzes risk assessment frameworks, ethical considerations, and compliance readiness.

## Admin Features

### Authentication
- Password-based authentication using ADMIN_PASS environment variable
- Simple token storage in localStorage (development implementation)
- Protected admin routes with Bearer token middleware

**Security Note**: Current implementation stores admin token in browser localStorage. For production use, consider implementing HTTP-only cookies or JWT tokens for enhanced security.

### Dashboard Capabilities
- **Response Listing**: Paginated view of all assessment submissions
- **Response Details**: Organization, industry, scores, and timestamps
- **Data Export**: Multiple export formats for data analysis
- **Basic Statistics**: Total response count and current page metrics

### Export Functionality
- **CSV Export**: Comprehensive dataset with all pillar scores and metadata
- **JSON Export**: Individual response data for detailed analysis
- **Automated Downloads**: Direct file downloads with proper naming conventions

## Development

### Project Structure
```
client/src/
├── components/     # Reusable UI components
├── pages/         # Application pages
├── lib/           # Utilities and configurations
└── hooks/         # Custom React hooks

server/
├── routes.ts      # API endpoint definitions
├── storage.ts     # Database interface
└── services/      # Business logic services

shared/
└── schema.ts      # Shared TypeScript types and Zod schemas
```

### Key Components
- **Assessment Flow**: Multi-step questionnaire with validation
- **Results Display**: Interactive charts and score visualization
- **Admin Interface**: Secure data management and export tools
- **Responsive Design**: Mobile-optimized throughout

## Deployment

This application is designed to run on Replit with automatic deployment capabilities:

1. **Environment Setup**: Configure ADMIN_PASS in Replit Secrets
2. **Storage**: Uses in-memory storage (data persists during session)
3. **Deployment**: Use Replit's deployment feature to publish your app

## Security Considerations

- Admin authentication using environment variables
- Request validation with Zod schemas
- Input validation for all API endpoints
- **Note**: Current implementation uses basic authentication suitable for development. For production deployment, consider implementing additional security measures such as HTTPS, CORS configuration, and secure session management.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is provided as-is for educational and development purposes.

## Support

For questions or support, please open an issue in the repository or contact the development team.