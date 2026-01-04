import { Story, ViralStory } from '../types/story';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface GenerateStoryRequest {
  topic: string;
  platform: string;
}

export async function generateStory(request: GenerateStoryRequest): Promise<ViralStory> {
  const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate story: ${response.statusText}`);
  }

  return response.json();
}

