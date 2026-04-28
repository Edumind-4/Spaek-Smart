export type Category = 'Travel' | 'Workplace' | 'Shopping' | 'Social' | 'Emergencies';

export interface Scenario {
  id: string;
  category: Category;
  title: string;
  icon: string;
  userObjective: string;
  aiPersona: string;
  startMessage: string;
  hints?: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface EvaluationReport {
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  corrections: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  feedback: string;
}
