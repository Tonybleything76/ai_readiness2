import jwt from 'jsonwebtoken';

// JWT configuration
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for production deployment');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_ISSUER = 'ai-readiness-app';
const JWT_AUDIENCE = 'admin-dashboard';

export interface JWTPayload {
  type: 'admin';
  iat: number;
  exp: number;
}

export class JWTService {
  /**
   * Generate a JWT token for admin authentication
   */
  static generateAdminToken(): string {
    const payload = {
      type: 'admin',
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: 'HS256',
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }) as JWTPayload;
      
      // Ensure it's an admin token
      if (decoded.type !== 'admin') {
        return null;
      }

      return decoded;
    } catch (error) {
      // Token is invalid, expired, or malformed
      return null;
    }
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
}