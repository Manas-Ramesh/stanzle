interface ThemeEmotionSelectorProps {
  theme: string;
  emotion: string;
  difficulty: "easy" | "hard";
  selectedPrompt?: "theme" | "emotion";
  onPromptSelect?: (prompt: "theme" | "emotion") => void;
}

export function ThemeEmotionSelector({
  theme,
  emotion,
  difficulty,
  selectedPrompt = "theme",
  onPromptSelect,
}: ThemeEmotionSelectorProps) {
  if (difficulty === "hard") {
    // Hard mode: show both theme and emotion
    return (
      <div className="text-center space-y-4 py-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          Today's Challenge
        </h2>
        
        <div className="space-y-2">
          <div>
            <span className="text-sm text-gray-500">Theme: </span>
            <span className="text-2xl font-bold text-gray-900">{theme}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Emotion: </span>
            <span className="text-2xl font-bold text-gray-900">{emotion}</span>
          </div>
        </div>
      </div>
    );
  }

  // Easy mode: choose either theme or emotion
  return (
    <div className="text-center space-y-4 py-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
        Choose Your Challenge
      </h2>
      
      <div className="flex justify-center gap-4">
        <button
          onClick={() => onPromptSelect?.("theme")}
          className={`px-6 py-4 border-2 rounded transition-colors ${
            selectedPrompt === "theme"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 bg-white text-gray-900 hover:border-gray-500"
          }`}
        >
          <div className="text-sm text-gray-500 mb-1">Theme</div>
          <div className="text-2xl font-bold">{theme}</div>
        </button>
        
        <button
          onClick={() => onPromptSelect?.("emotion")}
          className={`px-6 py-4 border-2 rounded transition-colors ${
            selectedPrompt === "emotion"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 bg-white text-gray-900 hover:border-gray-500"
          }`}
        >
          <div className="text-sm text-gray-500 mb-1">Emotion</div>
          <div className="text-2xl font-bold">{emotion}</div>
        </button>
      </div>
    </div>
  );
}