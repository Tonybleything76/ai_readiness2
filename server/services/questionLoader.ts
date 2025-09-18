import fs from 'fs';
import path from 'path';
import { AssessmentData, assessmentDataSchema } from "@shared/schema";

export class QuestionLoader {
  private questions: AssessmentData | null = null;

  async loadQuestions(): Promise<void> {
    try {
      const dataPath = path.resolve(process.cwd(), 'data', 'ai_readiness_custom_responses.json');
      const fileContent = await fs.promises.readFile(dataPath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      const parseResult = assessmentDataSchema.safeParse(jsonData);
      if (!parseResult.success) {
        throw new Error(`Invalid question data format: ${parseResult.error.message}`);
      }
      
      this.questions = parseResult.data;
      
      // Validate and set default weights
      this.questions.pillars.forEach(pillar => {
        pillar.questions.forEach(question => {
          if (question.weight === null || question.weight === undefined) {
            console.warn(`Question ${question.id} has null weight, defaulting to 0.06`);
            question.weight = 0.06;
          }
          
          // Validate responses and meanings have keys 1-5
          const requiredKeys = ['1', '2', '3', '4', '5'];
          for (const key of requiredKeys) {
            if (!question.responses[key]) {
              throw new Error(`Question ${question.id} missing response for key ${key}`);
            }
            if (!question.meanings[key]) {
              throw new Error(`Question ${question.id} missing meaning for key ${key}`);
            }
          }
        });
      });

      console.log(`Loaded ${this.questions.pillars.length} pillars with questions`);
    } catch (error) {
      console.error('Failed to load questions:', error);
      throw error;
    }
  }

  getQuestions(): AssessmentData {
    if (!this.questions) {
      throw new Error('Questions not loaded. Call loadQuestions() first.');
    }
    return this.questions;
  }
}
