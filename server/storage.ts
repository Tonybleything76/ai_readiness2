import { Response, InsertResponse } from '../shared/schema.js';

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
      id: crypto.randomUUID(),
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

export const storage = new MemStorage();
