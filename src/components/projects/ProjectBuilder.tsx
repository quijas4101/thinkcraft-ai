import { useState } from 'react';
import { ProjectTemplate, AIFeedback } from '@/types/project';
import { generateAIFeedback } from '@/lib/services/aiService';

export function ProjectBuilder() {
  const [project, setProject] = useState<ProjectTemplate>({
    type: 'writing',
    content: '',
    rubric: []
  });

  const [feedback, setFeedback] = useState<AIFeedback | null>(null);

  const handleAIFeedback = async () => {
    const aiFeedback = await generateAIFeedback(project);
    setFeedback(aiFeedback);
  };

  // Implementation needed
} 