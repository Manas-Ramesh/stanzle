import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { GameSettings } from "../components/GameSettings";
import { ThemeEmotionSelector } from "../components/ThemeEmotionSelector";
import { PoemEditor } from "../components/PoemEditor";
import { ScoreDisplay } from "../components/ScoreDisplay";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, getAuthToken } from "@/lib/api";
import { loadOrCreateDailyChallenge, type ChallengeWords } from "@/lib/challenge";
import {
  analyzePoem,
  normalizeTotalScore,
  scorePoem,
  type AiGuess,
  type ScoreResult,
} from "@/lib/poemPipeline";
import type { ComponentProps } from "react";

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

type StoredSubmission = Record<string, unknown>;

function mapStoredSubmissionToScoreDisplay(
  sub: StoredSubmission,
): ComponentProps<typeof ScoreDisplay> {
  const mode = sub.mode === "hard" ? "hard" : "easy";
  const selectedPrompt = sub.easy_selection === "emotion" ? "emotion" : "theme";
  const guess = (sub.ai_guess as { theme?: string; emotion?: string; confidence?: number }) || {};
  const ts = sub.theme_score;
  const es = sub.emotion_score;
  const cs = sub.creativity_score;
  const hasBreakdown = [ts, es, cs].some((v) => typeof v === "number" && !Number.isNaN(v));

  const feedback =
    typeof sub.ai_feedback === "string" && sub.ai_feedback.trim()
      ? sub.ai_feedback
      : "Detailed scoring notes weren’t saved for this play.";

  const guessedTheme =
    mode === "easy" && selectedPrompt === "emotion" ? "—" : String(guess.theme ?? "—");
  const guessedEmotion =
    mode === "easy" && selectedPrompt === "theme" ? "—" : String(guess.emotion ?? "—");

  const rawWords = sub.required_words;
  const words = Array.isArray(rawWords) ? (rawWords as string[]) : undefined;

  return {
    themeScore: typeof ts === "number" ? ts : Number(ts) || 0,
    emotionScore: typeof es === "number" ? es : Number(es) || 0,
    creativityScore: typeof cs === "number" ? cs : Number(cs) || 0,
    totalScore: typeof sub.score === "number" ? sub.score : Number(sub.score) || 0,
    showScoreBreakdown: hasBreakdown,
    aiAnalysis: {
      guessedTheme,
      guessedEmotion,
      confidence: confidencePercent(guess.confidence),
      feedback,
    },
    poemText: String(sub.poem_text ?? ""),
    wordBank: sub.word_bank_used && words?.length ? words : undefined,
    difficulty: mode,
    selectedPrompt,
    isDaily: true,
    hasCompletedDaily: true,
  };
}

export function DailyGamePage() {
  const { user, refreshUser } = useAuth();
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

  const [todayStatus, setTodayStatus] = useState<{
    loading: boolean;
    submitted: boolean;
    submission: StoredSubmission | null;
    score: number;
  }>({
    loading: false,
    submitted: false,
    submission: null,
    score: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setChallengeLoading(true);
    loadOrCreateDailyChallenge()
      .then((c) => {
        if (!cancelled) setChallenge(c);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Could not load daily challenge");
      })
      .finally(() => {
        if (!cancelled) setChallengeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || !getAuthToken()) {
      setTodayStatus({
        loading: false,
        submitted: false,
        submission: null,
        score: 0,
      });
      return;
    }
    let cancelled = false;
    setTodayStatus((s) => ({ ...s, loading: true }));
    apiFetch<{
      can_submit?: boolean;
      daily_score?: number;
      submission?: StoredSubmission | null;
    }>("/api/daily/submission-status", { method: "GET" })
      .then((s) => {
        if (cancelled) return;
        if (s.can_submit === false) {
          setTodayStatus({
            loading: false,
            submitted: true,
            submission: (s.submission as StoredSubmission) ?? null,
            score: s.daily_score ?? 0,
          });
        } else {
          setTodayStatus({
            loading: false,
            submitted: false,
            submission: null,
            score: 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTodayStatus({
            loading: false,
            submitted: false,
            submission: null,
            score: 0,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const requiredWords = wordBankEnabled && challenge ? challenge.words : [];

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

    const token = getAuthToken();
    if (!token) {
      toast.error("Log in to submit your daily score.");
      return;
    }

    try {
      const status = await apiFetch<{
        can_submit?: boolean;
        message?: string;
      }>("/api/daily/submission-status", { method: "GET" });

      if (!status.can_submit) {
        toast.error(status.message || "You cannot submit today.");
        return;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not check submission status");
      return;
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

      await apiFetch("/api/daily/submit", {
        method: "POST",
        body: JSON.stringify({
          score: total,
          mode: difficulty,
          easy_selection: difficulty === "easy" ? selectedPrompt : null,
          word_bank_used: wordBankEnabled,
          theme: challenge.theme,
          emotion: challenge.emotion,
          required_words: challenge.words,
          poem_text: trimmed,
          poem_html: trimmed.replace(/\n/g, "<br/>"),
          ai_guess: g,
          theme_score: s.themeScore ?? 0,
          emotion_score: s.emotionScore ?? 0,
          creativity_score: s.creativityScore ?? 0,
          ai_feedback: s.feedback ?? "",
        }),
      });

      setGuess(g);
      setScores(s);
      setHasSubmitted(true);
      setTodayStatus({
        loading: false,
        submitted: true,
        submission: null,
        score: total,
      });
      void refreshUser();
      toast.success("Daily score submitted!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [
    challenge,
    poemText,
    difficulty,
    selectedPrompt,
    wordBankEnabled,
    refreshUser,
  ]);

  if (challengeLoading || !challenge) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading today&apos;s challenge…</p>
      </div>
    );
  }

  const theme = challenge.theme;
  const emotion = challenge.emotion;

  if (user && getAuthToken() && todayStatus.loading && !hasSubmitted) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading your day…</p>
      </div>
    );
  }

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
      <ScoreDisplay
        themeScore={scores.themeScore ?? 0}
        emotionScore={scores.emotionScore ?? 0}
        creativityScore={scores.creativityScore ?? 0}
        totalScore={total}
        showScoreBreakdown
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
        isDaily
        hasCompletedDaily
      />
    );
  }

  if (user && todayStatus.submitted && todayStatus.submission) {
    return <ScoreDisplay {...mapStoredSubmissionToScoreDisplay(todayStatus.submission)} />;
  }

  if (user && todayStatus.submitted && !todayStatus.submission) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 border-2 border-gray-300 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900">Daily challenge complete</h2>
          <p className="text-gray-600">
            You already submitted today&apos;s poem
            {todayStatus.score !== undefined ? (
              <>
                {" "}
                <span className="font-bold text-gray-900">({todayStatus.score}/100)</span>
              </>
            ) : null}
            . Detailed results aren&apos;t stored for this submission.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/unlimited"
              className="px-6 py-3 bg-gray-900 text-white font-bold rounded hover:bg-gray-800 text-center"
            >
              Unlimited Mode
            </Link>
            <Link
              to="/progress"
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded hover:bg-gray-50 text-center"
            >
              View progress
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="space-y-6">
          {!user && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Log in from the home page to save your daily score.
            </p>
          )}
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
