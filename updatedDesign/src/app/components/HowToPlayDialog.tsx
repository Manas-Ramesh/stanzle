import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const STORAGE_KEY = "stanzle_how_to_play_dismissed_v1";

export function readHowToPlayDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markHowToPlayDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

type HowToPlayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next) markHowToPlayDismissed();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(85vh,640px)] overflow-y-auto sm:max-w-lg gap-0 border-gray-900 bg-white p-0 shadow-xl">
        <div className="px-6 pt-6 pb-4 pr-14">
          <DialogHeader className="text-left gap-1">
            <DialogTitle className="text-xl font-bold text-gray-900">How to play</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm leading-relaxed">
              Stanzle is a daily poetry challenge: everyone gets the same theme and emotion for the
              day. Write a short poem, submit once (when logged in), and see how well you matched
              the prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-5 text-sm text-gray-800">
            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900">Easy vs hard</h3>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-800">Easy:</span> Pick{" "}
                <strong>Theme</strong> or <strong>Emotion</strong> as your focus. Your score is
                based on how well you hit that one target plus a creativity component.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-800">Hard:</span> You’re scored on{" "}
                <strong>both</strong> theme and emotion, plus creativity — stricter, higher ceiling.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900">Word bank</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Off</strong> — write freely. <strong>On</strong> — you must use{" "}
                <em>every</em> listed word somewhere in your poem (spelling as given).
              </p>
              <div
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs text-gray-800 leading-relaxed"
                aria-label="Example"
              >
                <div className="text-[0.65rem] font-sans font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Example (word bank: drizzle, pavement)
                </div>
                drizzle beads the pavement — gray threads we walk through
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-gray-900">Submit & leaderboard</h3>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 leading-relaxed">
                <li>Logged-in players: one official submit per calendar day on your device.</li>
                <li>Guests can play and see a score; it isn’t saved or ranked.</li>
                <li>The daily leaderboard uses the same “today” as your device’s date.</li>
              </ul>
            </section>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 bg-gray-50 px-6 py-4 sm:justify-center">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="w-full sm:w-auto min-w-[10rem] px-8 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HowToPlayTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-gray-700 underline decoration-gray-400 underline-offset-2 hover:text-gray-900"
    >
      How to play
    </button>
  );
}
