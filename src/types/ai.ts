export interface AIScenario {
  title: string;
  description: string;
  gradeLevel: number;
  subject: string;
  createdAt: string;
}

export interface AIFeedback {
  suggestions: string[];
  score: number;
  analysis: string;
  improvements: string[];
}

export interface CodeReviewFeedback {
  metrics: {
    [key: string]: number;
  };
  suggestions: string[];
  codeAnalysis: string;
} 