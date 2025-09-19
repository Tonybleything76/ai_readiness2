import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Construct proper PostgreSQL connection string from individual env vars
// if DATABASE_URL is invalid (e.g., contains SQLite path)
function getConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Check if DATABASE_URL is valid PostgreSQL format
  if (databaseUrl && databaseUrl.startsWith('postgresql://')) {
    return databaseUrl;
  }
  
  // Fallback: construct from individual PostgreSQL environment variables
  const host = process.env.PGHOST;
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;
  
  if (!host || !user || !password || !database) {
    throw new Error(
      "DATABASE_URL invalid and PostgreSQL environment variables incomplete. Need PGHOST, PGUSER, PGPASSWORD, PGDATABASE"
    );
  }
  
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

const connectionString = getConnectionString();
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
