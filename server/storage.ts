import { type Response, type InsertResponse } from "@shared/schema";
import { PrismaClient } from "../generated/prisma";

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

export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;

  constructor() {
    // Set DATABASE_URL if not properly set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "file:./prisma/dev.db";
    }
    
    this.prisma = new PrismaClient();
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const response = await this.prisma.response.create({
      data: {
        orgName: insertResponse.orgName || null,
        industry: insertResponse.industry || null,
        answersJson: insertResponse.answersJson,
        pillarScores: insertResponse.pillarScores,
        overall: insertResponse.overall,
        category: insertResponse.category,
      },
    });
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    try {
      const response = await this.prisma.response.findUnique({
        where: { id },
      });
      return response || undefined;
    } catch (error) {
      console.error("Error fetching response:", error);
      return undefined;
    }
  }

  async getAllResponses(limit?: number, offset?: number): Promise<Response[]> {
    return await this.prisma.response.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getResponseCount(): Promise<number> {
    return await this.prisma.response.count();
  }

  async getResponsesByOrganization(orgName: string): Promise<HistoricalResponse[]> {
    return await this.prisma.response.findMany({
      where: { 
        orgName: orgName
      },
      select: {
        id: true,
        createdAt: true,
        orgName: true,
        industry: true,
        overall: true,
        pillarScores: true,
        // Explicitly exclude answersJson for privacy/security
        // answersJson: false, (implicit)
        category: true,
      },
      orderBy: { createdAt: 'asc' }, // Chronological order for historical tracking
    });
  }

  async getIndustryStatistics(industry: string): Promise<{
    count: number;
    overallMedian: number;
    pillarMedians: Record<string, number>;
    overallQuartiles: { q1: number; q3: number };
    pillarQuartiles: Record<string, { q1: number; q3: number }>;
  } | null> {
    // Get all responses for the industry
    const responses = await this.prisma.response.findMany({
      where: { 
        industry: industry
      }
    });

    // K-anonymity protection: only return statistics if >= 10 responses
    if (responses.length < 10) {
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
    const overallScores = responses.map(r => r.overall);
    const overallStats = calculateStats(overallScores);

    // Calculate pillar statistics
    const pillarMedians: Record<string, number> = {};
    const pillarQuartiles: Record<string, { q1: number; q3: number }> = {};

    // Get all unique pillar keys from responses
    const pillarKeys = new Set<string>();
    responses.forEach(response => {
      if (response.pillarScores && typeof response.pillarScores === 'object') {
        Object.keys(response.pillarScores).forEach(key => pillarKeys.add(key));
      }
    });

    pillarKeys.forEach(pillarKey => {
      const pillarScores = responses
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
      count: responses.length,
      overallMedian: overallStats.median,
      pillarMedians,
      overallQuartiles: { q1: overallStats.q1, q3: overallStats.q3 },
      pillarQuartiles
    };
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const storage = new PrismaStorage();
