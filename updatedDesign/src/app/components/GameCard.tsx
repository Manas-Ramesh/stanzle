import { Calendar, Trophy, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface GameCardProps {
  date: string;
  score: number;
  maxScore: number;
  status: "complete" | "incomplete";
  form: string;
  theme: string;
  emotion: string;
  poem: string;
  wordCount: number;
  onClick?: () => void;
}

export function GameCard({
  date,
  score,
  maxScore,
  status,
  form,
  theme,
  emotion,
  poem,
  wordCount,
  onClick,
}: GameCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {date}
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {score}/{maxScore}
          </div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              status === "complete"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status === "complete" ? "Complete" : "Incomplete"}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">
          →
        </button>
      </div>

      {/* Details */}
      <div className="mb-4 text-sm space-y-1">
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">Difficulty:</span> {form}
        </div>
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">Theme:</span> {theme}
        </div>
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">Emotion:</span> {emotion}
        </div>
      </div>

      {/* Poem Preview */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 italic line-clamp-2">"{poem}"</p>
      </div>

      {/* Word Count */}
      <div className="text-sm text-gray-600">
        {wordCount} words
      </div>
    </div>
  );
}