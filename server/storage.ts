import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { Response, InsertResponse, responses } from '../shared/schema.js';

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | null>;
  getAllResponses(): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private responses: Response[] = [];

  async createResponse(response: InsertResponse): Promise<Response> {
    // Ensure tier tracking consistency: derive missing field or use defaults
    let assessmentMode = response.assessmentMode;
    let questionCount = response.questionCount;

    if (assessmentMode && !questionCount) {
      // Derive questionCount from mode
      questionCount = assessmentMode === 'free' ? 25 : 90;
    } else if (!assessmentMode && questionCount) {
      // Derive assessmentMode from count and normalize count
      if (questionCount === 25) {
        assessmentMode = 'free';
      } else if (questionCount === 90) {
        assessmentMode = 'full';
      } else {
        // Invalid count: default to free tier with correct count
        assessmentMode = 'free';
        questionCount = 25;
      }
    } else if (assessmentMode && questionCount) {
      // Both provided: validate and coerce if mismatched
      const expectedCount = assessmentMode === 'free' ? 25 : 90;
      if (questionCount !== expectedCount) {
        // Coerce questionCount to match assessmentMode
        questionCount = expectedCount;
      }
    } else {
      // Apply defaults when both are missing
      assessmentMode = 'free';
      questionCount = 25;
    }

    const newResponse: Response = {
      id: randomUUID(),
      createdAt: new Date(),
      orgId: response.orgId || null,
      orgName: response.orgName || null,
      industry: response.industry || null,
      answersJson: response.answersJson,
      pillarScores: response.pillarScores,
      overall: response.overall,
      category: response.category,
      assessmentMode: assessmentMode!,
      questionCount: questionCount!,
    };
    this.responses.push(newResponse);
    return newResponse;
  }

  async getResponse(id: string): Promise<Response | null> {
    return this.responses.find(r => r.id === id) || null;
  }

  async getAllResponses(): Promise<Response[]> {
    return [...this.responses];
  }
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    // Ensure tier tracking consistency: derive missing field or use defaults
    let assessmentMode = response.assessmentMode;
    let questionCount = response.questionCount;

    if (assessmentMode && !questionCount) {
      questionCount = assessmentMode === 'free' ? 25 : 90;
    } else if (!assessmentMode && questionCount) {
      if (questionCount === 25) {
        assessmentMode = 'free';
      } else if (questionCount === 90) {
        assessmentMode = 'full';
      } else {
        assessmentMode = 'free';
        questionCount = 25;
      }
    } else if (assessmentMode && questionCount) {
      const expectedCount = assessmentMode === 'free' ? 25 : 90;
      if (questionCount !== expectedCount) {
        questionCount = expectedCount;
      }
    } else {
      assessmentMode = 'free';
      questionCount = 25;
    }

    const id = randomUUID();
    const newResponse: InsertResponse = {
      ...response,
      orgId: response.orgId || null,
      orgName: response.orgName || null,
      industry: response.industry || null,
      assessmentMode: assessmentMode!,
      questionCount: questionCount!,
    };

    await this.db.insert(responses).values({ id, ...newResponse });
    
    const [created] = await this.db
      .select()
      .from(responses)
      .where(eq(responses.id, id));
    
    return created;
  }

  async getResponse(id: string): Promise<Response | null> {
    const [response] = await this.db
      .select()
      .from(responses)
      .where(eq(responses.id, id));
    
    return response || null;
  }

  async getAllResponses(): Promise<Response[]> {
    return await this.db.select().from(responses);
  }
}

// Use database if DATABASE_URL is set, otherwise use memory storage
export const storage = process.env.DATABASE_URL 
  ? new DbStorage() 
  : new MemStorage();
