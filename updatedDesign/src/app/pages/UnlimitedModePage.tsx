import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import { GameSettings } from "../components/GameSettings";
import { ThemeEmotionSelector } from "../components/ThemeEmotionSelector";
import { PoemEditor } from "../components/PoemEditor";
import { ScoreDisplay } from "../components/ScoreDisplay";
import { fetchNewChallenge, trackChallengeForArchive, type ChallengeWords } from "@/lib/challenge";
import {
  analyzePoem,
  normalizeTotalScore,
  scorePoem,
  type AiGuess,
  type ScoreResult,
} from "@/lib/poemPipeline";

function confidencePercent(c: number | undefined) {
  if (c === undefined || c === null) return 0;
  const n = Number(c);
  if (n <= 1 && n >= 0) return Math.round(n * 100);
  return Math.round(Math.min(100, Math.max(0, n)));
}

function missingWords(poem: string, words: string[]) {
  const lower = poem.toLowerCase();
  return words.filter((w) => !lower.includes(w.toLowerCase()));
}

export function UnlimitedModePage() {
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [wordBankEnabled, setWordBankEnabled] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<"theme" | "emotion">("theme");
  const [poemText, setPoemText] = useState("");

  const [challenge, setChallenge] = useState<ChallengeWords | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(true);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [guess, setGuess] = useState<AiGuess | null>(null);
  const [scores, setScores] = useState<ScoreResult | null>(null);

  const loadChallenge = useCallback(async () => {
    setChallengeLoading(true);
    try {
      const c = await fetchNewChallenge();
      setChallenge(c);
      void trackChallengeForArchive(c);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load challenge");
    } finally {
      setChallengeLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  const requiredWords = wordBankEnabled && challenge ? challenge.words : [];

  const handleReset = useCallback(() => {
    setHasSubmitted(false);
    setPoemText("");
    setGuess(null);
    setScores(null);
    void loadChallenge();
  }, [loadChallenge]);

  const handleSubmit = useCallback(async () => {
    if (!challenge) return;
    const trimmed = poemText.trim();
    if (!trimmed) {
      toast.error("Write a poem before submitting.");
      return;
    }
    if (difficulty === "easy" && !selectedPrompt) {
      toast.error("Choose theme or emotion for easy mode.");
      return;
    }
    if (wordBankEnabled) {
      const miss = missingWords(trimmed, challenge.words);
      if (miss.length > 0) {
        toast.error(`Include all word-bank words. Missing: ${miss.join(", ")}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const focus = difficulty === "easy" ? selectedPrompt : undefined;
      const g = await analyzePoem(trimmed, difficulty, focus);
      const s = await scorePoem(
        trimmed,
        challenge.theme,
        challenge.emotion,
        g,
        difficulty,
        focus,
      );
      const total = normalizeTotalScore(s, difficulty, selectedPrompt);
      setGuess(g);
      setScores({ ...s, totalScore: total });
      setHasSubmitted(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [challenge, poemText, difficulty, selectedPrompt, wordBankEnabled]);

  if (challengeLoading || !challenge) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading challenge…</p>
      </div>
    );
  }

  const theme = challenge.theme;
  const emotion = challenge.emotion;

  if (hasSubmitted && guess && scores) {
    const total = normalizeTotalScore(scores, difficulty, selectedPrompt);
    const feedback = scores.feedback ?? "";
    const guessedTheme =
      difficulty === "easy" && selectedPrompt === "emotion"
        ? "—"
        : String(guess.theme ?? "—");
    const guessedEmotion =
      difficulty === "easy" && selectedPrompt === "theme"
        ? "—"
        : String(guess.emotion ?? "—");

    return (
      <>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center mb-8 pb-6 border-b border-gray-300 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlimited Mode</h1>
            <p className="text-sm text-gray-600 mb-4">Practice anytime</p>
            <Link to="/play">
              <button type="button" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Daily Challenge
              </button>
            </Link>
          </div>
        </div>

        <ScoreDisplay
          themeScore={scores.themeScore ?? 0}
          emotionScore={scores.emotionScore ?? 0}
          creativityScore={scores.creativityScore ?? 0}
          totalScore={total}
          aiAnalysis={{
            guessedTheme,
            guessedEmotion,
            confidence: confidencePercent(guess.confidence),
            feedback,
          }}
          poemText={poemText}
          wordBank={wordBankEnabled ? challenge.words : undefined}
          difficulty={difficulty}
          selectedPrompt={selectedPrompt}
          isDaily={false}
          onNewChallenge={handleReset}
        />
      </>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8 pb-6 border-b border-gray-300">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlimited Mode</h1>
          <p className="text-sm text-gray-600 mb-4">Practice anytime</p>
          <Link to="/play">
            <button type="button" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Daily Challenge
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          <GameSettings
            difficulty={difficulty}
            wordBankEnabled={wordBankEnabled}
            onDifficultyChange={setDifficulty}
            onWordBankToggle={setWordBankEnabled}
          />

          <ThemeEmotionSelector
            theme={theme}
            emotion={emotion}
            difficulty={difficulty}
            selectedPrompt={selectedPrompt}
            onPromptSelect={setSelectedPrompt}
          />

          <PoemEditor
            key={`${theme}-${emotion}-${challenge.words.join("-")}`}
            requiredWords={requiredWords}
            onTextChange={setPoemText}
          />

          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="px-12 py-3 bg-gray-900 text-white font-bold rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Scoring…" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
