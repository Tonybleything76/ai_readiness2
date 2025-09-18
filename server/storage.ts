import { type Response, type InsertResponse } from "@shared/schema";
import { PrismaClient } from "../generated/prisma";

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getAllResponses(): Promise<Response[]>;
}

export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;

  constructor() {
    // Debug DATABASE_URL before creating PrismaClient
    console.log("DATABASE_URL from env:", process.env.DATABASE_URL);
    
    // Set DATABASE_URL if not properly set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('DATABASE_URL=')) {
      process.env.DATABASE_URL = "file:./dev.db";
      console.log("Fixed DATABASE_URL to:", process.env.DATABASE_URL);
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

  async getAllResponses(): Promise<Response[]> {
    return await this.prisma.response.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const storage = new PrismaStorage();
