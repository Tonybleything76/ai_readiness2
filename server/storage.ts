import { Response, InsertResponse } from '../shared/schema.js';

export interface IStorage {
  createResponse(response: InsertResponse): Promise<Response>;
  getResponse(id: number): Promise<Response | null>;
  getAllResponses(): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private responses: Response[] = [];
  private nextId = 1;

  async createResponse(response: InsertResponse): Promise<Response> {
    const newResponse: Response = {
      ...response,
      id: this.nextId++,
      createdAt: new Date(),
    };
    this.responses.push(newResponse);
    return newResponse;
  }

  async getResponse(id: number): Promise<Response | null> {
    return this.responses.find(r => r.id === id) || null;
  }

  async getAllResponses(): Promise<Response[]> {
    return [...this.responses];
  }
}

export const storage = new MemStorage();
