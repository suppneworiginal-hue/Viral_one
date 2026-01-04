import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { SceneCard } from './components/SceneCard';
import { ThinkingState } from './components/ThinkingState';
import { ThinkingTraceAccordion } from './components/ThinkingTraceAccordion';
import { generateStory, GenerateStoryRequest } from './services/api';
import { ViralStory, Scene } from './types/story';

function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [story, setStory] = useState<ViralStory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: GenerateStoryRequest = {
        topic: topic.trim(),
        platform,
      };
      const generatedStory = await generateStory(request);
      setStory(generatedStory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setLoading(false);
    }
  };

  const handleSceneTextChange = (sceneId: number, newText: string) => {
    if (!story) return;

    const updatedScenes = story.scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, text_content: newText } : scene
    );

    setStory({ ...story, scenes: updatedScenes });
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-youtube-red" />
            Viral Story Generator
          </h1>
          <p className="text-gray-400">Create engaging viral content with AI-powered storytelling</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Story Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Topic
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Enter your story topic or idea..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-transparent"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-youtube-red hover:bg-youtube-red/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Story
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {story && (
                  <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-md text-sm">
                    <div className="font-semibold mb-1">{story.title}</div>
                    <div className="text-xs text-green-400">
                      Clickbait Score: {story.clickbait_score}/100
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Storyboard */}
          <div className="space-y-6">
            {/* Thinking State UI */}
            {loading && <ThinkingState isActive={loading} />}
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Storyboard</h2>
              
              {story ? (
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {/* Thinking Trace Accordion */}
                  {story.thinking_trace && (
                    <ThinkingTraceAccordion thinkingTrace={story.thinking_trace} />
                  )}
                  
                  {/* Scene Cards */}
                  {story.scenes.map((scene) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      onTextChange={handleSceneTextChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Generate a story to see the storyboard</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

