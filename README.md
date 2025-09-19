# AI Readiness Assessment Tool

A comprehensive enterprise-grade web application for evaluating organizations' readiness for AI adoption across multiple assessment pillars including technology infrastructure, data management, organizational culture, strategic planning, and risk management.

## 🚀 Features

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
- **Professional PDF Reports**: Server-side PDF generation with branded reports
- **Mobile Responsive**: Optimized charts and interface for mobile devices
- **Results Metadata**: Display of organization info, industry, and timestamp

### Phase 3: Production Features ✅
- **JWT Authentication**: Secure token-based authentication system
- **Server-side PDF Generation**: Professional branded reports using Puppeteer
- **Admin Dashboard**: Enhanced admin panel with filtering and export capabilities
- **Security Hardening**: HTTPS enforcement, CORS, rate limiting, and security headers
- **Database Integration**: PostgreSQL with Drizzle ORM for production data persistence
- **Health Monitoring**: Comprehensive health check endpoints for deployment

### Admin Dashboard Features ✅
- **Secure Admin Access**: JWT-based authentication replacing basic password auth
- **Advanced Filtering**: Filter responses by date range, organization, and industry
- **Response Management**: View and manage all assessment responses with pagination
- **Multi-format Export**: 
  - CSV export of filtered responses with comprehensive data
  - JSON export of individual responses
  - PDF export of individual assessment reports
- **Statistics Dashboard**: Overview of total responses and average scores
- **Real-time Data**: Live updates with proper cache invalidation

### Phase 8: Backup Management System ✅
- **Automated Database Backups**: Scheduled nightly backups with configurable retention
- **Web-based Backup Dashboard**: Complete backup management interface for administrators
- **Backup Verification**: File integrity verification with checksums and compression testing
- **Restore Capabilities**: Secure database restore with environmental safeguards and confirmation workflows
- **Comprehensive Audit Logging**: Complete audit trail for all backup operations (manual and automated)
- **CSRF Protection**: Security-hardened APIs with CSRF token validation for all operations
- **Path Traversal Protection**: Secure file handling preventing unauthorized access
- **Multi-format Support**: Handles SQL dumps, compressed files, and custom PostgreSQL formats

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM for production
- **Authentication**: JWT tokens with secure cookie handling
- **PDF Generation**: Puppeteer for server-side PDF reports
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter for client-side routing
- **Security**: Helmet, CORS, Rate Limiting, Input Validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Replit provides built-in PostgreSQL)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Required for production
   DATABASE_URL=postgresql://...          # PostgreSQL connection string
   JWT_SECRET=your-secret-key-32-chars    # JWT signing secret (min 32 chars)
   
   # Optional configuration
   CORS_ORIGIN=https://yourdomain.com     # Allowed CORS origins (comma-separated)
   LOG_LEVEL=info                         # Logging level (debug, info, warn, error)
   
   # Backup system configuration (optional)
   BACKUP_CRON=0 2 * * *                  # Backup schedule (default: daily at 2 AM)
   BACKUP_OUTPUT_DIR=./backups            # Backup storage directory
   BACKUP_RETENTION_DAYS=30               # Days to keep backups (default: 30)
   ALLOW_DB_RESTORE=true                  # Enable database restore operations (production only)
   TZ=UTC                                 # Timezone for backup scheduling
   ```

3. **Initialize the database**:
   ```bash
   npm run db:push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000` (or your Replit domain).

### Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

## 📖 Usage

### Taking an Assessment

1. **Start Assessment**: Navigate to the home page and click "Start Assessment"
2. **Organization Info**: Enter your organization name and industry (optional)
3. **Complete Questionnaire**: Answer questions across all 5 assessment pillars
4. **View Results**: Review your comprehensive readiness report with interactive charts
5. **Export PDF**: Download a professional PDF summary with organization branding

### Admin Dashboard

1. **Access Admin Panel**: Navigate to `/admin/login`
2. **Create Admin Account**: Use the admin creation interface (first-time setup)
3. **Login**: Enter your admin credentials
4. **Advanced Filtering**: 
   - Filter by date range (from/to dates)
   - Search by organization name
   - Filter by industry sector
5. **Export Filtered Data**: 
   - Download CSV of filtered responses with comprehensive metrics
   - Export individual responses as JSON files
   - Generate PDF reports for any assessment
6. **Manage Data**: View detailed statistics and response metadata with real-time updates

### Backup Management

**⚠️ SuperAdmin Role Required**: All backup operations require SuperAdmin privileges.

1. **Access Backup Dashboard**: Navigate to `/admin/backups` or click "Backups" from any admin page
2. **System Status**: Monitor backup scheduler status, last backup time, and storage health
3. **Manual Backup**: 
   - Click "Run Backup Now" to trigger immediate database backup
   - View real-time progress and completion status
4. **Backup Management**:
   - **List Backups**: View all available backup files with metadata (size, date, format)
   - **Verify Backup**: Test backup integrity with checksum validation and compression testing
   - **Download Backup**: Securely download backup files for external storage
   - **Restore Database**: Restore from backup with safety confirmation workflows
5. **Automated Backups**: 
   - Scheduler runs nightly in production environments (configurable via `BACKUP_CRON`)
   - Automatic retention management based on `BACKUP_RETENTION_DAYS` setting
   - Complete audit logging for compliance and monitoring

**Security Features**:
- Environmental safeguards (production-only scheduling, restore gates)
- CSRF protection on all backup operations
- Path traversal protection for file operations
- Explicit confirmation required for destructive operations
- Pre-restore safety backups automatically created

## 📊 Assessment Pillars

### 1. Technology Infrastructure
Evaluates current technology capabilities, data infrastructure, AI tools availability, and integration readiness.

### 2. Data Management
Assesses data quality, governance frameworks, accessibility, and analytical capabilities.

### 3. Organizational Culture
Reviews AI understanding, change readiness, digital transformation mindset, and staff training.

### 4. Strategic Planning
Examines AI strategy integration, goal alignment, success metrics, and business case development.

### 5. Risk Management
Analyzes risk assessment frameworks, ethical considerations, compliance readiness, and security measures.

## 🔐 Security Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based system with proper expiration
- **Admin Role Management**: Structured admin creation and authentication flow
- **Secure Token Storage**: HTTP-only cookies with secure flags in production
- **Password Security**: Proper hashing and validation

### Security Hardening
- **HTTPS Enforcement**: Automatic HTTPS redirect in production environments
- **CORS Configuration**: Configurable cross-origin resource sharing policies
- **Rate Limiting**: API endpoint protection with configurable limits
- **Security Headers**: Comprehensive security headers via Helmet.js
- **Input Validation**: Zod schema validation for all API endpoints
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM

### Production Security
- **Environment Validation**: Required environment variable checks
- **Secret Management**: Secure handling of JWT secrets and database credentials
- **Content Security Policy**: Strict CSP headers for XSS protection
- **Request Size Limits**: Protection against oversized request attacks

## 📊 Admin Features

### Dashboard Capabilities
- **Response Management**: Paginated view with advanced filtering options
- **Real-time Statistics**: Live dashboard with response counts and metrics
- **Data Visualization**: Charts and graphs for assessment trends
- **Export Tools**: Multiple export formats for comprehensive data analysis

### Filtering System
- **Date Range Filtering**: Filter responses by creation date
- **Organization Search**: Text-based search across organization names
- **Industry Filtering**: Filter by industry sectors
- **Combined Filters**: Apply multiple filters simultaneously
- **Filter State Management**: Persistent filter state with clear options

### Export Functionality
- **Filtered CSV Export**: Export only filtered results with full dataset
- **Individual JSON Export**: Detailed response data for analysis
- **PDF Report Generation**: Professional branded assessment reports
- **Automated Downloads**: Direct file downloads with proper naming conventions

## 🔧 Development

### Project Structure
```
client/src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui base components
│   └── results/   # Assessment result components
├── pages/         # Application pages and routes
├── lib/           # Utilities and configurations
└── hooks/         # Custom React hooks

server/
├── routes.ts      # API endpoint definitions
├── storage.ts     # Database interface and operations
├── auth/          # Authentication services
├── services/      # Business logic services
│   ├── questionLoader.ts  # Question management
│   ├── scorer.ts         # Assessment scoring logic
│   └── pdfGenerator.ts   # PDF generation service
└── config/        # Configuration files

shared/
└── schema.ts      # Shared TypeScript types and Zod schemas
```

### Key Development Features
- **Hot Module Replacement**: Fast development with Vite HMR
- **TypeScript**: Full type safety across frontend and backend
- **Schema Validation**: Shared validation between client and server
- **Database Migrations**: Automatic schema synchronization
- **Code Quality**: ESLint and TypeScript strict mode

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Comprehensive system health
- `GET /api/questions` - Assessment questions
- `POST /api/score` - Submit assessment responses
- `GET /api/response/:id` - Retrieve assessment results
- `GET /api/report/pdf/:id` - Download PDF report

### Admin Endpoints (JWT Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/responses` - List responses with filtering
- `GET /api/admin/export/csv` - Export filtered CSV data
- `GET /api/admin/export/json/:id` - Export individual JSON
- `GET /api/admin/export/pdf/:id` - Generate admin PDF report

### Health Check Endpoints
- `GET /api/health` - Quick health status
- `GET /api/health/detailed` - Database, JWT, and system checks

## 🚀 Deployment

### Replit Deployment
1. **Environment Configuration**: Set up required environment variables in Replit Secrets
2. **Database Setup**: Configure PostgreSQL connection (automatic in Replit)
3. **Build Process**: Use Replit's build system or run `npm run build`
4. **Deployment**: Deploy using Replit's deployment features

### Manual Deployment
1. **Server Requirements**: Node.js 18+, PostgreSQL database
2. **Environment Setup**: Configure all required environment variables
3. **Build Application**: Run `npm run build` for production builds
4. **Process Management**: Use PM2 or similar for production process management
5. **Reverse Proxy**: Configure nginx or similar for HTTPS and static file serving

### Health Monitoring
- Use `/api/health/detailed` for comprehensive system monitoring
- Set up monitoring alerts based on health check responses
- Monitor database connectivity and JWT service health

## 🔧 Configuration

### Environment Variables

#### Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (minimum 32 characters)

#### Optional
- `CORS_ORIGIN`: Comma-separated list of allowed origins
- `LOG_LEVEL`: Logging level (debug, info, warn, error)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development, production)

### Production Configuration
The application includes comprehensive production configuration in `server/config/production.ts`:

- **Security Headers**: Comprehensive CSP and security configurations
- **Rate Limiting**: Configurable rate limits for different endpoint types
- **Database Settings**: Connection pooling and timeout configurations
- **PDF Generation**: Optimized Puppeteer settings for production
- **Health Checks**: Monitoring and alerting configurations

## 🧪 Testing

### End-to-End Testing
The application includes comprehensive testing capabilities:

1. **Assessment Flow Testing**: Complete user journey from start to PDF export
2. **Admin Dashboard Testing**: Authentication, filtering, and export functionality
3. **API Endpoint Testing**: All public and protected endpoints
4. **Security Testing**: Authentication, authorization, and input validation

### Running Tests
```bash
# Run development server for testing
npm run dev

# Access test endpoints
curl http://localhost:5000/api/health/detailed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Zod schemas for all API validation
- Implement proper error handling and logging
- Add appropriate test coverage for new features
- Follow security best practices for authentication and data handling

## 📄 License

This project is provided as-is for educational and development purposes.

## 🆘 Support

For questions or support, please open an issue in the repository or contact the development team.

## 🔄 Version History

### v3.0.0 - Production Release
- JWT-based authentication system
- Server-side PDF generation with Puppeteer
- PostgreSQL database integration
- Advanced admin filtering and export capabilities
- Comprehensive security hardening
- Production-ready deployment configuration

### v2.0.0 - Admin Dashboard
- Admin authentication and dashboard
- Data export capabilities (CSV/JSON)
- Response management and pagination
- Security enhancements

### v1.0.0 - Core Assessment Platform
- Multi-pillar assessment questionnaire
- Real-time scoring and visualization
- Professional results display
- PDF export functionality