import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo,
  Redo,
  Search,
  Music,
  AlignLeft,
} from "lucide-react";
import { cn } from "./ui/utils";

interface PoemEditorProps {
  requiredWords?: string[];
  placeholder?: string;
  onTextChange?: (text: string) => void;
}

const FONT_STACKS: Record<string, string> = {
  Inter: "Inter, ui-sans-serif, system-ui, sans-serif",
  Arial: "Arial, Helvetica, sans-serif",
  Georgia: "Georgia, serif",
  "Times New Roman": "'Times New Roman', Times, serif",
};

function getPlainText(el: HTMLElement | null) {
  if (!el) return "";
  return (el.innerText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "");
}

function wordUsedInPoem(poemLower: string, word: string) {
  return poemLower.includes(word.toLowerCase());
}

/** Semantic &lt;b&gt;/&lt;i&gt;/&lt;u&gt; toggle more reliably than CSS spans for execCommand. */
function ensureSemanticInlineCommands() {
  try {
    document.execCommand("styleWithCSS", false, "false");
  } catch {
    /* ignore */
  }
}

export function PoemEditor({
  requiredWords = [],
  placeholder = "Start writing your poem...",
  onTextChange,
}: PoemEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const foreInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const pendingRangeRef = useRef<Range | null>(null);

  const [wordCount, setWordCount] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [poemLower, setPoemLower] = useState("");
  const [activeBold, setActiveBold] = useState(false);
  const [activeItalic, setActiveItalic] = useState(false);
  const [activeUnderline, setActiveUnderline] = useState(false);
  const [activeStrike, setActiveStrike] = useState(false);

  useEffect(() => {
    ensureSemanticInlineCommands();
  }, []);

  const stashSelection = useCallback(() => {
    const sel = window.getSelection();
    const ed = editorRef.current;
    if (!sel?.rangeCount || !ed) return;
    const node = sel.anchorNode;
    if (node && ed.contains(node)) {
      pendingRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restorePendingSelection = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    const r = pendingRangeRef.current;
    if (r) {
      try {
        if (ed.contains(r.commonAncestorContainer)) {
          sel.addRange(r);
          return;
        }
      } catch {
        /* stale range */
      }
    }
    const end = document.createRange();
    end.selectNodeContents(ed);
    end.collapse(false);
    sel.addRange(end);
    pendingRangeRef.current = end.cloneRange();
  }, []);

  const refreshCommandState = useCallback(() => {
    const ed = editorRef.current;
    const sel = window.getSelection();
    // While focus is on the toolbar, the selection anchor can leave the editor briefly.
    // Do not reset toggles to false — that made Bold look "off" while text was still bold.
    if (!ed || !sel?.anchorNode || !ed.contains(sel.anchorNode)) {
      return;
    }
    setActiveBold(document.queryCommandState("bold"));
    setActiveItalic(document.queryCommandState("italic"));
    setActiveUnderline(document.queryCommandState("underline"));
    setActiveStrike(document.queryCommandState("strikeThrough"));
  }, []);

  useEffect(() => {
    const onSel = () => refreshCommandState();
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [refreshCommandState]);

  const syncFromDom = useCallback(() => {
    const text = getPlainText(editorRef.current);
    const count = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(count);
    setShowPlaceholder(!text.trim());
    setPoemLower(text.toLowerCase());
    onTextChange?.(text);
    refreshCommandState();
  }, [onTextChange, refreshCommandState]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  /** Apply inline CSS at selection or caret (caret gets a zero-width space so the next keystrokes pick up the style). */
  const applyInlineStyles = useCallback((styles: Record<string, string>) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    restorePendingSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const span = document.createElement("span");
    Object.entries(styles).forEach(([k, v]) => {
      span.style.setProperty(k, v);
    });

    if (range.collapsed) {
      const zw = document.createTextNode("\u200b");
      span.appendChild(zw);
      range.insertNode(span);
      const nr = document.createRange();
      nr.setStart(zw, 1);
      nr.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nr);
      pendingRangeRef.current = nr.cloneRange();
    } else {
      try {
        range.surroundContents(span);
      } catch {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
      sel.removeAllRanges();
      const nr = document.createRange();
      nr.selectNodeContents(span);
      nr.collapse(false);
      sel.addRange(nr);
      pendingRangeRef.current = nr.cloneRange();
    }
  }, [restorePendingSelection]);

  const exec = useCallback(
    (command: string, value?: string) => {
      restorePendingSelection();
      focusEditor();
      try {
        document.execCommand(command, false, value);
      } catch {
        /* ignore */
      }
      syncFromDom();
    },
    [restorePendingSelection, syncFromDom],
  );

  const toggleFormat = useCallback(
    (command: "bold" | "italic" | "underline" | "strikeThrough") => {
      restorePendingSelection();
      focusEditor();
      try {
        ensureSemanticInlineCommands();
        document.execCommand(command, false);
      } catch {
        /* ignore */
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          syncFromDom();
        });
      });
    },
    [restorePendingSelection, syncFromDom],
  );

  const applyFontFamily = (family: string) => {
    const stack = FONT_STACKS[family] ?? family;
    restorePendingSelection();
    applyInlineStyles({ fontFamily: stack });
    requestAnimationFrame(() => syncFromDom());
  };

  const applyFontSize = (px: string) => {
    restorePendingSelection();
    applyInlineStyles({ fontSize: px, lineHeight: "1.5" });
    requestAnimationFrame(() => syncFromDom());
  };

  const applyForeColor = (hex: string) => {
    restorePendingSelection();
    applyInlineStyles({ color: hex });
    requestAnimationFrame(() => syncFromDom());
  };

  const applyBackColor = (hex: string) => {
    restorePendingSelection();
    applyInlineStyles({ backgroundColor: hex });
    requestAnimationFrame(() => syncFromDom());
  };

  const handleFind = () => {
    const q = window.prompt("Find in your poem:", "");
    if (!q || !editorRef.current) return;
    editorRef.current.focus();
    const w = window as Window & { find?: (s: string, ...args: boolean[]) => boolean };
    if (typeof w.find === "function") {
      let found = false;
      const sel = window.getSelection();
      sel?.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(true);
      sel?.addRange(range);
      for (let i = 0; i < 200; i++) {
        if (w.find(q, false, false, true)) {
          found = true;
          break;
        }
      }
      if (!found) window.alert("No matches found.");
    } else {
      const text = getPlainText(editorRef.current);
      window.alert(text.includes(q) ? "Text is in your poem (use ⌘F / Ctrl+F to jump)." : "No matches found.");
    }
  };

  const insertMusic = () => {
    stashSelection();
    restorePendingSelection();
    focusEditor();
    document.execCommand("insertText", false, " ♪ ");
    syncFromDom();
  };

  const wordLabel = wordCount === 1 ? "1 word" : `${wordCount} words`;

  return (
    <div className="space-y-6">
      {requiredWords.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Required Words
          </h3>
          <div className="flex flex-wrap gap-2">
            {requiredWords.map((word, index) => {
              const used = wordUsedInPoem(poemLower, word);
              return (
                <span
                  key={`${word}-${index}`}
                  className={cn(
                    "px-4 py-2 font-medium text-sm rounded border-2 transition-colors",
                    used
                      ? "bg-green-50 border-green-500 text-green-800"
                      : "bg-red-50 border-red-400 text-red-700",
                  )}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="poem-editor">
            Your Poem
          </label>
          <span className="text-sm text-gray-500">{wordLabel}</span>
        </div>

        <div
          className="border-2 border-gray-300 rounded-t bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-1"
          onMouseDownCapture={stashSelection}
        >
          <button
            type="button"
            className={cn(
              "p-1.5 rounded transition-colors",
              activeBold ? "bg-gray-300" : "hover:bg-gray-200",
            )}
            title="Bold — toggle for next typing, or apply to selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("bold")}
          >
            <Bold className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className={cn(
              "p-1.5 rounded transition-colors",
              activeItalic ? "bg-gray-300" : "hover:bg-gray-200",
            )}
            title="Italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("italic")}
          >
            <Italic className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className={cn(
              "p-1.5 rounded transition-colors",
              activeUnderline ? "bg-gray-300" : "hover:bg-gray-200",
            )}
            title="Underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("underline")}
          >
            <Underline className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className={cn(
              "p-1.5 rounded transition-colors",
              activeStrike ? "bg-gray-300" : "hover:bg-gray-200",
            )}
            title="Strikethrough"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("strikeThrough")}
          >
            <Strikethrough className="w-4 h-4 text-gray-700" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-gray-500 max-w-[7rem]"
            defaultValue="Inter"
            onMouseDown={() => stashSelection()}
            onChange={(e) => {
              applyFontFamily(e.target.value);
            }}
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>

          <select
            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:border-gray-500"
            defaultValue="16px"
            onMouseDown={() => stashSelection()}
            onChange={(e) => {
              applyFontSize(e.target.value);
            }}
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Text color"
            onMouseDown={(e) => {
              stashSelection();
              e.preventDefault();
            }}
            onClick={() => foreInputRef.current?.click()}
          >
            <div className="w-4 h-4 bg-black rounded-sm border border-gray-300" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Highlight color"
            onMouseDown={(e) => {
              stashSelection();
              e.preventDefault();
            }}
            onClick={() => backInputRef.current?.click()}
          >
            <div className="w-4 h-4 bg-white rounded-sm border border-gray-300" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Undo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("undo")}
          >
            <Undo className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Redo"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("redo")}
          >
            <Redo className="w-4 h-4 text-gray-700" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Find"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleFind}
          >
            <Search className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Align left"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("justifyLeft")}
          >
            <AlignLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Insert music symbol"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertMusic}
          >
            <Music className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <input
          ref={foreInputRef}
          type="color"
          className="absolute -left-[9999px] w-8 h-8 opacity-0"
          defaultValue="#111827"
          onInput={(e) => applyForeColor((e.target as HTMLInputElement).value)}
          aria-label="Text color"
        />
        <input
          ref={backInputRef}
          type="color"
          className="absolute -left-[9999px] w-8 h-8 opacity-0"
          defaultValue="#fef08a"
          onInput={(e) => applyBackColor((e.target as HTMLInputElement).value)}
          aria-label="Highlight color"
        />

        <div
          ref={editorRef}
          id="poem-editor"
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={syncFromDom}
          onKeyUp={stashSelection}
          onMouseUp={stashSelection}
          onBlur={syncFromDom}
          onPaste={(e) => {
            e.preventDefault();
            stashSelection();
            restorePendingSelection();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            syncFromDom();
          }}
          className={cn(
            "poem-editor-area relative w-full min-h-[300px] p-4 bg-white border-2 border-t-0 border-gray-300 rounded-b resize-y overflow-auto focus:outline-none focus:border-gray-900 text-base text-gray-900",
            showPlaceholder &&
              "before:content-[attr(data-placeholder)] before:absolute before:top-4 before:left-4 before:text-gray-400 before:pointer-events-none",
          )}
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        />
      </div>
    </div>
  );
}
