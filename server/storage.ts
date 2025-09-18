import { type Response, type InsertResponse } from "@shared/schema";
import { PrismaClient } from "../generated/prisma";

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getAllResponses(limit?: number, offset?: number): Promise<Response[]>;
  getResponseCount(): Promise<number>;
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

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export const storage = new PrismaStorage();
