"""
Story Generator Agent using Claude 4.5 Sonnet.
Generates viral story scripts with thinking capabilities.
"""
import os
import json
import re
from anthropic import AsyncAnthropic
from schemas.story import ViralStory, Scene, VisualPrompt


# Load API key from environment
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY environment variable is not set. Please set it before running.")


SYSTEM_PROMPT = """You are an expert Viral Scriptwriter using the 'Thinking Process'.

STEP 1: THINKING (Internal Monologue)
First, analyze the Topic. Identify the core emotion (Fear, Curiosity, Anger). Plan the pacing. 
Write out this analysis explicitly.

STEP 2: GENERATION
Create a JSON object adhering strictly to the `ViralStory` schema.
- The hook (Scene 1) must be less than 5 seconds.
- The Visual Prompts must be detailed and cinematic, in English, optimized for image generation.
- The Voiceover text must be in English, using simple, punchy language (A2/B1 level) with "YouTuber style" - high energy, direct address to the viewer."""


async def generate_viral_story(topic: str) -> ViralStory:
    """
    Generate a viral story using Claude 4.5 Sonnet with thinking enabled.
    
    Args:
        topic: The story topic/theme
        
    Returns:
        ViralStory object with thinking_trace and generated content
        
    Raises:
        ValueError: If API key is missing or JSON parsing fails
        RuntimeError: If API call fails
    """
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
    
    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    
    # Build the user prompt
    user_prompt = f"""Generate a viral story script for the topic: "{topic}"

Requirements:
- Create 3-5 scenes that build suspense and engagement
- Scene 1 (hook) must be less than 5 seconds duration
- Each scene must have:
  - Voiceover text in ENGLISH language using "YouTuber style":
    * High energy and enthusiastic
    * Direct address to viewer (use "you", "your", etc.)
    * Simple, punchy English (A2/B1 vocabulary level)
    * Avoid complex grammar - use short, impactful sentences
    * Examples: "You won't believe this!", "This will shock you!", "Wait until you see..."
  - Detailed, cinematic visual prompt in English (optimized for image generation) with description, camera_angle, and mood
  - Estimated duration in seconds
- The story should have a high clickbait score (80-100)
- Title should be attention-grabbing in English

Output the story as valid JSON matching the ViralStory schema. The JSON must include:
- title: Catchy, attention-grabbing title in English
- topic: The provided topic
- target_audience: Specific demographic/psychographic
- scenes: Array of Scene objects, each with:
  - id: Sequential number (1, 2, 3...)
  - text_content: Voiceover text in ENGLISH with YouTuber style (high energy, direct address, simple A2/B1 level)
  - visual_prompts: Object with description (detailed and cinematic, in English, optimized for image generation), camera_angle, mood
  - estimated_duration: Duration in seconds (Scene 1 must be < 5 seconds)
- clickbait_score: Integer 0-100
- thinking_trace: A summary of your internal reasoning from STEP 1 (thinking process) explaining:
  * The core emotion identified (Fear, Curiosity, or Anger)
  * Why this story will go viral
  * The psychological triggers used
  * How the pacing prevents drop-off
  * Why this appeals to the target audience

CRITICAL: 
- Output ONLY valid JSON, no markdown code blocks, no thinking text outside the JSON.
- All voiceover text (text_content) MUST be in English with YouTuber style (high energy, direct address, simple A2/B1 level).
- All visual prompts MUST be in English, optimized for image generation.
- Scene 1 duration MUST be less than 5 seconds.
"""

    try:
        # Make API call with thinking enabled
        message = await client.messages.create(
            model="claude-4-5-sonnet-20250929",
            max_tokens=4096,
            thinking={
                "type": "enabled",
                "budget_tokens": 2048
            },
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": user_prompt
                }
            ]
        )
        
        # Extract thinking trace from the response (for thinking_trace field)
        thinking_trace = ""
        if hasattr(message, 'thinking') and message.thinking:
            if isinstance(message.thinking, str):
                thinking_trace = message.thinking
            elif hasattr(message.thinking, 'content'):
                thinking_trace = str(message.thinking.content)
            else:
                thinking_trace = str(message.thinking)
        
        # Extract the text content from message content blocks
        text_content = ""
        if message.content:
            for content_block in message.content:
                # Handle text content blocks
                if hasattr(content_block, 'text'):
                    text_content += content_block.text
                # Handle thinking content blocks (if present in content array)
                elif hasattr(content_block, 'type') and content_block.type == 'thinking':
                    if hasattr(content_block, 'content'):
                        thinking_trace = str(content_block.content)
        
        # Strip thinking text that might appear before/after JSON
        # Remove any text before the first { or after the last }
        cleaned_text = text_content.strip()
        
        # Find JSON object boundaries
        first_brace = cleaned_text.find('{')
        last_brace = cleaned_text.rfind('}')
        
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            # Extract only the JSON portion
            cleaned_text = cleaned_text[first_brace:last_brace + 1]
        
        # Remove markdown code blocks if present
        cleaned_text = re.sub(r'^```(?:json)?\s*\n', '', cleaned_text, flags=re.MULTILINE)
        cleaned_text = re.sub(r'\n```\s*$', '', cleaned_text, flags=re.MULTILINE)
        cleaned_text = cleaned_text.strip()
        
        # Parse the JSON response
        try:
            story_data = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Failed to parse JSON response from Claude. "
                f"Error: {str(e)}. "
                f"Response preview: {text_content[:500]}"
            )
        
        # Extract thinking_trace from JSON if present, otherwise use extracted thinking
        if 'thinking_trace' in story_data and story_data['thinking_trace']:
            thinking_trace = story_data['thinking_trace']
        elif not thinking_trace:
            thinking_trace = "AI reasoning: Analysis completed in thinking process. Core emotion and pacing strategy determined."
        
        # Ensure thinking_trace is never empty
        if not thinking_trace or thinking_trace.strip() == "":
            thinking_trace = "AI reasoning: Story generated with viral optimization strategies based on emotional triggers and pacing analysis."
        
        # Validate Scene 1 duration
        scenes_data = story_data.get('scenes', [])
        if scenes_data and len(scenes_data) > 0:
            scene1_duration = scenes_data[0].get('estimated_duration', 0)
            if scene1_duration >= 5:
                # Log warning but don't fail - just note it
                print(f"Warning: Scene 1 duration ({scene1_duration}s) should be less than 5 seconds")
        
        # Build scenes
        scenes = []
        for scene_data in scenes_data:
            visual_prompt_data = scene_data.get('visual_prompts', {})
            if not isinstance(visual_prompt_data, dict):
                raise ValueError(f"Invalid visual_prompts format in scene {scene_data.get('id', 'unknown')}")
            
            visual_prompt = VisualPrompt(
                description=visual_prompt_data.get('description', ''),
                camera_angle=visual_prompt_data.get('camera_angle', ''),
                mood=visual_prompt_data.get('mood', '')
            )
            
            scene = Scene(
                id=scene_data.get('id', 0),
                text_content=scene_data.get('text_content', ''),
                visual_prompts=visual_prompt,
                estimated_duration=scene_data.get('estimated_duration', 0)
            )
            scenes.append(scene)
        
        # Create ViralStory
        viral_story = ViralStory(
            title=story_data.get('title', 'Untitled Story'),
            topic=story_data.get('topic', topic),
            target_audience=story_data.get('target_audience', 'General audience'),
            scenes=scenes,
            clickbait_score=story_data.get('clickbait_score', 85),
            thinking_trace=thinking_trace
        )
        
        return viral_story
    
    except ValueError as e:
        # Re-raise ValueError as-is (for JSON parsing errors, missing API key)
        raise e
    except Exception as e:
        # Wrap other exceptions
        raise RuntimeError(f"Failed to generate viral story: {str(e)}")
