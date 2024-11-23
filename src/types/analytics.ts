export interface ProjectAnalytics {
  complexityScore: number;
  linesOfCode: number;
  timeSpent: number;
  milestoneCount: number;
  languageBreakdown: {
    [key: string]: number;
  };
  lastUpdated: string;
}

export interface UserAnalytics {
  totalProjects: number;
  completedChallenges: number;
  timeSpent: number;
  skillLevels: {
    [key: string]: number;
  };
  engagement: {
    lastActive: string;
    totalActions: number;
    activityBreakdown: {
      [key: string]: number;
    };
  };
} 