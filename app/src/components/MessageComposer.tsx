// Real editable drafts, user-chosen tone rewrites and explicit send confirmation from the Make flow.
import { useRef, useState } from "react";
import { OnboardingMo as Mo } from "./OnboardingMo";
import { toneWarning } from "../lib/chat";
import { gentleDraft, previewDrafts } from "../lib/community";
export function MessageComposer({
  name,
  online,
  disabled,
  onSend,
  context,
  personalContext,
}: {
  name: string;
  online: boolean;
  disabled?: boolean;
  onSend: (text: string, id: string) => Promise<void>;
  context: string;
  personalContext?: string;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const pending = useRef<{ text: string; id: string } | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const why = toneWarning(draft);
  async function send(confirmed = false) {
    if (busy || !online || disabled || !draft.trim()) return;
    if (why && !confirmed) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    setError("");
    setSent(false);
    if (pending.current?.text !== draft.trim())
      pending.current = { text: draft.trim(), id: crypto.randomUUID() };
    try {
      await onSend(pending.current.text, pending.current.id);
      setDraft("");
      setConfirm(false);
      pending.current = null;
      setSuggestions([]);
      setSent(true);
      input.current?.focus();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your message could not be sent. Your draft is still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function suggest() {
    setAiBusy(true);
    setError("");
    setSent(false);
    try {
      const result = await previewDrafts(context, personalContext);
      setSuggestions(result.suggestions);
      if (!result.suggestions.length)
        setError("No ideas right now. You can write your own message.");
    } catch {
      setError(
        "Mo could not get ideas right now. You can still write your own.",
      );
    } finally {
      setAiBusy(false);
    }
  }
  async function gentle() {
    setAiBusy(true);
    setError("");
    try {
      setDraft(await gentleDraft(draft, personalContext));
      setConfirm(false);
      input.current?.focus();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your draft is still here. Please try again.",
      );
    } finally {
      setAiBusy(false);
    }
  }
  return (
    <div className="real-composer">
      {error && (
        <p className="community-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <span className="sr-only" role="status">
          Message sent
        </span>
      )}
      {suggestions.length > 0 && (
        <div className="composer-ideas">
          <div>
            <Mo size={20} />
            <span>Mo’s ideas · tap to use</span>
          </div>
          <div className="composer-chips">
            {suggestions.map((s) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => {
                  setDraft(s);
                  setSent(false);
                  input.current?.focus();
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => void suggest()} disabled={aiBusy || !online}>
            More ideas
          </button>
        </div>
      )}
      {why && (
        <div className="tone-card">
          <div>
            <Mo mood="worried" size={32} />
            <span>This might sound harsh to {name}.</span>
          </div>
          <span className="why-line">{why}</span>
          <div className="composer-chips">
            <button
              disabled={busy || aiBusy || !online}
              onClick={() => void gentle()}
            >
              Say it gently
            </button>
            <button
              disabled={busy || aiBusy || !online}
              onClick={() => void send(true)}
            >
              Send anyway
            </button>
          </div>
        </div>
      )}
      {!suggestions.length && (
        <button
          className="need-idea"
          disabled={aiBusy || !online || disabled}
          onClick={() => void suggest()}
        >
          {aiBusy ? "Thinking…" : "Need an idea?"}
        </button>
      )}
      <div className="composer-row">
        <textarea
          ref={input}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setSent(false);
            setConfirm(false);
            setError("");
          }}
          aria-label={`Message ${name}`}
          placeholder="Write a message…"
          rows={1}
          maxLength={2000}
          disabled={busy || disabled}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button
          className="send-circle"
          aria-label={`Send to ${name}`}
          disabled={busy || disabled || !online || !draft.trim()}
          onClick={() => void send()}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </button>
      </div>
      {confirm && (
        <div
          className="tone-confirm"
          role="dialog"
          aria-label="Pause before sending"
        >
          <p>Want to pause before sending?</p>
          <button
            disabled={busy || aiBusy || !online}
            onClick={() => void gentle()}
          >
            Say it gently
          </button>
          <button disabled={busy || !online} onClick={() => void send(true)}>
            Send anyway
          </button>
          <button onClick={() => setConfirm(false)}>Keep editing</button>
        </div>
      )}
      <small className="composer-disclosure">
        When you ask, Bridge sends Mo your preferences, today’s check-in, and
        up to 3 recent messages from this chat. Sending checks your text for
        safety.
      </small>
    </div>
  );
}
