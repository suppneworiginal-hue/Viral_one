from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from schemas.story import ViralStory, Scene, VisualPrompt


app = FastAPI(title="Viral Story Generator API")

# Enable CORS for localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateStoryRequest(BaseModel):
    """Request schema for story generation."""
    topic: str
    platform: str


def generate_mock_story(topic: str, platform: str) -> ViralStory:
    """
    Generate a hardcoded mock viral story about a Mystery Bunker.
    This allows frontend testing without LLM integration.
    """
    return ViralStory(
        title="The Hidden Bunker: What They Don't Want You to Know",
        topic=topic,
        target_audience="Mystery enthusiasts and conspiracy theorists",
        scenes=[
            Scene(
                id=1,
                text_content="A mysterious bunker discovered deep in the woods. Local authorities are keeping it secret, but we found the entrance.",
                visual_prompts=VisualPrompt(
                    description="A dark, overgrown forest with a hidden concrete entrance partially covered by vines",
                    camera_angle="Low angle, dramatic",
                    mood="Mysterious, ominous"
                ),
                estimated_duration=5
            ),
            Scene(
                id=2,
                text_content="Inside, we found documents dating back decades. The truth is more shocking than we imagined.",
                visual_prompts=VisualPrompt(
                    description="Dimly lit bunker interior with old filing cabinets and scattered documents",
                    camera_angle="Medium shot, handheld",
                    mood="Tense, investigative"
                ),
                estimated_duration=7
            ),
            Scene(
                id=3,
                text_content="The final revelation will change everything you thought you knew. This story can't be ignored.",
                visual_prompts=VisualPrompt(
                    description="Close-up of a revealing document with dramatic lighting",
                    camera_angle="Extreme close-up",
                    mood="Revelatory, shocking"
                ),
                estimated_duration=4
            )
        ],
        clickbait_score=95,
        thinking_trace="""AI Reasoning Analysis:

Target Audience: Mystery enthusiasts and conspiracy theorists aged 18-45 who consume true crime and mystery content. This demographic responds strongly to hidden secrets and government cover-ups.

Psychological Trigger: CURIOSITY - The story uses the "hidden truth" pattern which triggers intense curiosity. The progression from discovery → investigation → revelation creates a compelling narrative arc that keeps viewers engaged.

Pacing Strategy:
- Second 5: Opens with a dramatic visual (hidden bunker entrance) and a hook about authorities keeping secrets. This prevents early drop-off by immediately establishing intrigue.
- Second 15: Reveals the discovery of documents, building on the initial hook and adding layers of mystery. This maintains engagement through the critical retention point.
- Second 30: The final scene promises a "revelation that changes everything" - this creates anticipation for the next part, encouraging viewers to watch until the end and potentially engage (like, comment, share).

Why This Will Go Viral:
1. The topic taps into universal curiosity about hidden secrets and government cover-ups
2. The pacing creates multiple "must-see" moments that prevent scrolling away
3. The visual progression (forest → interior → document) creates a satisfying narrative arc
4. The clickbait title promises exclusive information, triggering FOMO (Fear of Missing Out)
5. The story structure allows for easy expansion into a series, encouraging follow-up engagement"""
    )


@app.post("/api/generate-story", response_model=ViralStory)
async def generate_story(request: GenerateStoryRequest) -> ViralStory:
    """
    Generate a viral story based on topic and platform.
    Uses Claude 4.5 Sonnet with thinking mode for high-quality generation.
    Falls back to mock data if AI generation fails (e.g., missing API key).
    """
    try:
        from agents.story_generator import generate_viral_story
        # Generate story using AI (async)
        viral_story = await generate_viral_story(request.topic)
        return viral_story
    except ValueError as e:
        # Missing API key or JSON parsing error - use mock data
        print(f"AI generation unavailable: {str(e)}. Using mock data.")
        return generate_mock_story(request.topic, request.platform)
    except RuntimeError as e:
        # API call failed - use mock data
        print(f"AI generation failed: {str(e)}. Using mock data.")
        return generate_mock_story(request.topic, request.platform)
    except Exception as e:
        # Any other error - use mock data
        print(f"Unexpected error during AI generation: {str(e)}. Using mock data.")
        return generate_mock_story(request.topic, request.platform)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Viral Story Generator API is running"}

