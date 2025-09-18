/**
 * Production configuration for AI Readiness Assessment application
 * Optimized settings for production deployment with enhanced security
 */

export const productionConfig = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: true, // Important for deployments behind reverse proxies
  },

  // Security configurations
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['https://*.replit.app', 'https://*.replit.dev'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
    
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for PDF generation
    },

    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: 'Too many requests, please try again later.',
      },
    },

    // Specific rate limits for different endpoints
    authRateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 5, // Limit auth attempts
      skipSuccessfulRequests: true,
    },

    pdfRateLimit: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // Limit PDF generation requests
    },
  },

  // Database configuration
  database: {
    connectionTimeout: 30000,
    idleTimeout: 600000,
    maxConnections: 20,
  },

  // PDF generation settings
  pdf: {
    timeout: 30000, // 30 seconds timeout for PDF generation
    launchOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json', // JSON format for production logs
  },

  // Health check configuration
  healthCheck: {
    timeout: 5000,
    checkInterval: 30000, // 30 seconds
  },
};

// Validate required environment variables for production
export function validateProductionEnvironment(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for production');
  }
}