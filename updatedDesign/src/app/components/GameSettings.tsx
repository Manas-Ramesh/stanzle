interface GameSettingsProps {
  difficulty: "easy" | "hard";
  wordBankEnabled: boolean;
  onDifficultyChange: (difficulty: "easy" | "hard") => void;
  onWordBankToggle: (enabled: boolean) => void;
}

export function GameSettings({
  difficulty,
  wordBankEnabled,
  onDifficultyChange,
  onWordBankToggle,
}: GameSettingsProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-300">
      {/* Difficulty */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Difficulty:</span>
        <div className="flex gap-2">
          <button
            onClick={() => onDifficultyChange("easy")}
            className={`px-4 py-1.5 text-sm font-medium rounded ${
              difficulty === "easy"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => onDifficultyChange("hard")}
            className={`px-4 py-1.5 text-sm font-medium rounded ${
              difficulty === "hard"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Hard
          </button>
        </div>
      </div>

      {/* Word Bank Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Word Bank:</span>
        <div className="flex gap-2">
          <button
            onClick={() => onWordBankToggle(false)}
            className={`px-4 py-1.5 text-sm font-medium rounded ${
              !wordBankEnabled
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Off
          </button>
          <button
            onClick={() => onWordBankToggle(true)}
            className={`px-4 py-1.5 text-sm font-medium rounded ${
              wordBankEnabled
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            On
          </button>
        </div>
      </div>
    </div>
  );
}