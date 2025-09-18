import { type Response, type InsertResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: string): Promise<Response | undefined>;
  getAllResponses(): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private responses: Map<string, Response>;

  constructor() {
    this.responses = new Map();
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      id,
      createdAt: new Date(),
      orgName: insertResponse.orgName || null,
      industry: insertResponse.industry || null,
      answersJson: insertResponse.answersJson,
      pillarScores: insertResponse.pillarScores,
      overall: insertResponse.overall,
      category: insertResponse.category,
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponse(id: string): Promise<Response | undefined> {
    return this.responses.get(id);
  }

  async getAllResponses(): Promise<Response[]> {
    return Array.from(this.responses.values());
  }
}

export const storage = new MemStorage();
