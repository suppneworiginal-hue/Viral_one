from pydantic import BaseModel
from typing import List


class VisualPrompt(BaseModel):
    """Schema for visual prompt generation."""
    description: str
    camera_angle: str
    mood: str


class Scene(BaseModel):
    """Schema for a single story scene."""
    id: int
    text_content: str
    visual_prompts: VisualPrompt
    estimated_duration: int


class Story(BaseModel):
    """Schema for a complete viral story."""
    title: str
    topic: str
    target_audience: str
    scenes: List[Scene]
    clickbait_score: int


class ViralStory(BaseModel):
    """Schema for a viral story with AI thinking trace."""
    title: str
    topic: str
    target_audience: str
    scenes: List[Scene]
    clickbait_score: int
    thinking_trace: str  # AI's internal reasoning about why this story will go viral

