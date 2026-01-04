import { Scene } from '../types/story';
import { Clock } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  onTextChange: (sceneId: number, newText: string) => void;
}

export function SceneCard({ scene, onTextChange }: SceneCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          Scene {scene.id}
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-youtube-red/20 border border-youtube-red/30 rounded-full">
          <Clock className="w-4 h-4 text-youtube-red" />
          <span className="text-sm font-medium text-youtube-red">
            {scene.estimated_duration}s
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Voiceover Text
          </label>
          <textarea
            value={scene.text_content}
            onChange={(e) => onTextChange(scene.id, e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-transparent resize-none"
            rows={4}
            placeholder="Enter voiceover text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Visual Prompt
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-md px-4 py-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {scene.visual_prompts.description}
            </p>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span><strong>Angle:</strong> {scene.visual_prompts.camera_angle}</span>
              <span><strong>Mood:</strong> {scene.visual_prompts.mood}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

