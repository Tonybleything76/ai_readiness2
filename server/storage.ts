import { type Response, type InsertResponse, responses } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

// Safe historical response type (excludes sensitive answersJson)
export type HistoricalResponse = {
  id: string;
  createdAt: Date;
  orgName: string | null;
  industry: string | null;
  overall: number;
  pillarScores: any;
  category: string;
};

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getAllResponses(limit?: number, offset?: number): Promise<Response[]>;
  getResponseCount(): Promise<number>;
  getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]>;
  getIndustryStatistics(industry: string): Promise<{
    count: number;
    overallMedian: number;
    pillarMedians: Record<string, number>;
    overallQuartiles: { q1: number; q3: number };
    pillarQuartiles: Record<string, { q1: number; q3: number }>;
  } | null>;
}

export class DatabaseStorage implements IStorage {

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db
      .insert(responses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    try {
      const [response] = await db
        .select()
        .from(responses)
        .where(eq(responses.id, id));
      return response || undefined;
    } catch (error) {
      console.error("Error fetching response:", error);
      return undefined;
    }
  }

  async getAllResponses(limit?: number, offset?: number): Promise<Response[]> {
    const query = db
      .select()
      .from(responses)
      .orderBy(desc(responses.createdAt));
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }
    
    return await query;
  }

  async getResponseCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(responses);
    return result.count;
  }

  async getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]> {
    try {
      const results = await db
        .select({
          id: responses.id,
          createdAt: responses.createdAt,
          orgName: responses.orgName,
          industry: responses.industry,
          overall: responses.overall,
          pillarScores: responses.pillarScores,
          category: responses.category,
        })
        .from(responses)
        .where(eq(responses.orgName, orgName))
        .orderBy(desc(responses.createdAt));
      return results;
    } catch (error) {
      console.error("Error fetching responses by organization:", error);
      return [];
    }
  }

  async getIndustryStatistics(industry: string): Promise<{
    count: number;
    overallMedian: number;
    pillarMedians: Record<string, number>;
    overallQuartiles: { q1: number; q3: number };
    pillarQuartiles: Record<string, { q1: number; q3: number }>;
  } | null> {
    // Get all responses for the industry
    const responseList = await db
      .select()
      .from(responses)
      .where(eq(responses.industry, industry));

    // K-anonymity protection: only return statistics if >= 10 responses
    if (responseList.length < 10) {
      return null;
    }

    // Helper function to calculate median and quartiles
    const calculateStats = (values: number[]) => {
      const sorted = values.sort((a, b) => a - b);
      const n = sorted.length;
      
      const median = n % 2 === 0 
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];
      
      const q1Index = Math.floor(n / 4);
      const q3Index = Math.floor(3 * n / 4);
      const q1 = sorted[q1Index];
      const q3 = sorted[q3Index];
      
      return { median, q1, q3 };
    };

    // Calculate overall score statistics
    const overallScores = responseList.map(r => r.overall);
    const overallStats = calculateStats(overallScores);

    // Calculate pillar statistics
    const pillarMedians: Record<string, number> = {};
    const pillarQuartiles: Record<string, { q1: number; q3: number }> = {};

    // Get all unique pillar keys from responses
    const pillarKeys = new Set<string>();
    responseList.forEach(response => {
      if (response.pillarScores && typeof response.pillarScores === 'object') {
        Object.keys(response.pillarScores).forEach(key => pillarKeys.add(key));
      }
    });

    pillarKeys.forEach(pillarKey => {
      const pillarScores = responseList
        .map(response => {
          if (response.pillarScores && typeof response.pillarScores === 'object' && response.pillarScores !== null) {
            return (response.pillarScores as Record<string, any>)[pillarKey];
          }
          return undefined;
        })
        .filter(score => typeof score === 'number') as number[];
      
      if (pillarScores.length > 0) {
        const pillarStats = calculateStats(pillarScores);
        pillarMedians[pillarKey] = pillarStats.median;
        pillarQuartiles[pillarKey] = { q1: pillarStats.q1, q3: pillarStats.q3 };
      }
    });

    return {
      count: responseList.length,
      overallMedian: overallStats.median,
      pillarMedians,
      overallQuartiles: { q1: overallStats.q1, q3: overallStats.q3 },
      pillarQuartiles
    };
  }

  async disconnect(): Promise<void> {
    // Drizzle with connection pooling handles disconnection automatically
  }
}

export const storage = new DatabaseStorage();
