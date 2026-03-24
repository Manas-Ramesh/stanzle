import { Button } from "./ui/button";
import { Link } from "react-router";

interface ScoreDisplayProps {
  themeScore: number;
  emotionScore?: number;
  creativityScore: number;
  totalScore: number;
  aiAnalysis: {
    guessedTheme: string;
    guessedEmotion?: string;
    confidence: number;
    feedback: string;
  };
  poemText?: string;
  wordBank?: string[];
  difficulty?: "easy" | "hard";
  /** Easy mode: which prompt was scored */
  selectedPrompt?: "theme" | "emotion";
  isDaily?: boolean;
  hasCompletedDaily?: boolean;
  onNewChallenge?: () => void;
  /** When false, only the total /100 is shown (e.g. legacy submissions without stored breakdown). */
  showScoreBreakdown?: boolean;
}

export function ScoreDisplay({
  themeScore,
  emotionScore,
  creativityScore,
  totalScore,
  aiAnalysis,
  poemText,
  wordBank,
  difficulty = "easy",
  selectedPrompt = "theme",
  isDaily = true,
  hasCompletedDaily = false,
  onNewChallenge,
  showScoreBreakdown = true,
}: ScoreDisplayProps) {
  const isHard = difficulty === "hard";

  const primaryLabel = isHard
    ? "Theme match"
    : selectedPrompt === "theme"
      ? "Theme match"
      : "Emotion match";

  const primaryValue = isHard ? themeScore : selectedPrompt === "theme" ? themeScore : (emotionScore ?? 0);

  const primaryMax = isHard ? 40 : 80;

  const secondaryLabel = isHard ? "Emotion match" : "Creativity";
  const secondaryValue = isHard ? (emotionScore ?? 0) : creativityScore;
  const secondaryMax = isHard ? 40 : 20;

  const tertiaryLabel = isHard ? "Creativity" : null;
  const tertiaryValue = isHard ? creativityScore : null;
  const tertiaryMax = isHard ? 20 : null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,600px)_1fr] gap-12 lg:gap-24">
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              Your Score
            </h2>
            <div className="text-6xl font-bold text-gray-900 mb-6">
              {totalScore}/100
            </div>
          </div>

          {showScoreBreakdown && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-700 capitalize">{primaryLabel}</span>
                <span className="text-lg font-bold text-gray-900">
                  {primaryValue}/{primaryMax}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-700 capitalize">{secondaryLabel}</span>
                <span className="text-lg font-bold text-gray-900">
                  {secondaryValue}/{secondaryMax}
                </span>
              </div>
              {isHard && tertiaryLabel && tertiaryValue !== null && tertiaryMax !== null && (
                <div className="flex items-center justify-between py-3 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-700">{tertiaryLabel}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {tertiaryValue}/{tertiaryMax}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-white border-2 border-gray-300 rounded p-6">
            <h3 className="font-bold text-gray-900 mb-4">AI Feedback</h3>
            <div className="space-y-3 text-sm">
              {(isHard || selectedPrompt === "theme") && (
                <div>
                  <span className="font-medium text-gray-700">Guessed theme:</span>{" "}
                  <span className="text-gray-900">{aiAnalysis.guessedTheme}</span>
                </div>
              )}
              {(isHard || selectedPrompt === "emotion") && aiAnalysis.guessedEmotion && (
                <div>
                  <span className="font-medium text-gray-700">Guessed emotion:</span>{" "}
                  <span className="text-gray-900">{aiAnalysis.guessedEmotion}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Confidence:</span>{" "}
                <span className="text-gray-900">{aiAnalysis.confidence}%</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed">{aiAnalysis.feedback}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {wordBank && wordBank.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Word Bank
              </h3>
              <div className="flex flex-wrap gap-2">
                {wordBank.map((word, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-900 text-white font-medium text-sm rounded"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Your Poem
            </h3>
            <div className="bg-white border-2 border-gray-300 rounded p-6 min-h-[12rem]">
              <p className="text-gray-900 whitespace-pre-wrap text-base leading-relaxed">
                {poemText || "No poem text provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-12">
        <div className="max-w-md w-full">
          {isDaily && hasCompletedDaily && (
            <div className="text-center space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Daily Challenge Complete</h3>
              <p className="text-gray-600">Come back tomorrow for a new challenge</p>
              <div className="flex flex-col gap-3">
                <Button className="w-full rounded-full font-bold" size="lg" asChild>
                  <Link to="/unlimited">Try Unlimited Mode</Link>
                </Button>
                <Button variant="outline" className="w-full rounded-full font-bold border-2" size="lg" asChild>
                  <Link to="/progress">View Progress</Link>
                </Button>
              </div>
            </div>
          )}

          {!isDaily && onNewChallenge && (
            <div className="text-center">
              <Button onClick={onNewChallenge} className="rounded-full font-bold px-8" size="lg">
                New Challenge
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
