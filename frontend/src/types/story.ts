/**
 * TypeScript interfaces matching the Pydantic models in backend/schemas/story.py
 */

export interface VisualPrompt {
  description: string;
  camera_angle: string;
  mood: string;
}

export interface Scene {
  id: number;
  text_content: string;
  visual_prompts: VisualPrompt;
  estimated_duration: number;
}

export interface Story {
  title: string;
  topic: string;
  target_audience: string;
  scenes: Scene[];
  clickbait_score: number;
}

export interface ViralStory {
  title: string;
  topic: string;
  target_audience: string;
  scenes: Scene[];
  clickbait_score: number;
  thinking_trace: string; // AI's internal reasoning about why this story will go viral
}

