import { useEffect, useRef, useState } from "react";
import { OnboardingMo as Mo } from "./OnboardingMo";
export type SupportTool = "reset" | "low" | "help";
const options = [
  {
    label: "Practice with me",
    id: "practice",
    bg: "var(--soft2)",
    color: "var(--accent)",
    path: "M4 10 Q4 5 9 5 L15 5 Q20 5 20 10 L20 14 Q20 18 15 18 L13 18 L10 21 L10 18 L9 18 Q4 18 4 14 Z",
  },
  {
    label: "Breathe with me",
    id: "reset",
    bg: "#EEF2FF",
    color: "#7C6FAF",
    path: "M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 13h14a3 3 0 1 1-3 3M3 17h6",
  },
  {
    label: "I'm feeling low",
    id: "low",
    bg: "#FEF3E8",
    color: "#E8A44A",
    path: "M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11Z",
  },
  {
    label: "I need help",
    id: "help",
    bg: "#FEE8E8",
    color: "#D96B6B",
    path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5v6M12 16.2v.3",
  },
] as const;
export function DashboardNav({
  onNavigate,
  onTool,
  feeling,
  currentScreen = "home",
}: {
  currentScreen?: "home" | "circles" | "dms" | "events" | "practice" | "me";
  onNavigate: (id: "home" | "circles" | "me" | "practice") => void;
  onTool: (tool: SupportTool) => void;
  feeling: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 299, y: 21 });
  const [bounds, setBounds] = useState({ width: 390, height: 844 });
  const fab = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    bottom: number;
    moved: boolean;
  } | null>(null);
  useEffect(() => {
    const parent = fab.current?.parentElement;
    if (!parent) return;
    const size = () => {
      setBounds({ width: parent.clientWidth, height: parent.clientHeight });
      setPos((p) => ({
        ...p,
        x: Math.min(p.x, parent.clientWidth - 62),
        y: Math.min(p.y, parent.clientHeight - 62),
      }));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (open) menu.current?.querySelector("button")?.focus();
  }, [open]);
  function close() {
    setOpen(false);
    fab.current?.focus();
  }
  return (
    <>
      {open && (
        <>
          <button
            className="make-mo-overlay"
            aria-label="Close Mo menu"
            onClick={close}
          />
          <div
            ref={menu}
            role="menu"
            aria-label="Mo"
            className="make-mo-menu"
            style={{
              left: Math.min(Math.max(10, pos.x - 176), bounds.width - 238),
              bottom: Math.min(pos.y + 80, bounds.height - 300),
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                close();
              }
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const items = Array.from(
                  e.currentTarget.querySelectorAll("button"),
                );
                const i = items.indexOf(
                  document.activeElement as HTMLButtonElement,
                );
                items[
                  (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                    items.length
                ].focus();
              }
            }}
          >
            {options.map((o) => (
              <button
                role="menuitem"
                key={o.id}
                onClick={() => {
                  setOpen(false);
                  if (o.id === "practice") onNavigate("practice");
                  else onTool(o.id);
                }}
              >
                <span style={{ background: o.bg }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={o.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={o.path} />
                  </svg>
                </span>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
      <nav className="make-nav" aria-label="Main">
        {(
          [
            {
              id: "home",
              label: "Home",
              path: "M3 10.8 12 3l9 7.8M5.5 9.5V21h13V9.5",
            },
            {
              id: "circles",
              label: "Circles",
              path: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20c.5-3.5 2.5-5 5.5-5s5 1.5 5.5 5M13.5 15.3c.8-.2 1.6-.3 2.5-.3 3 0 5 1.5 5.5 5",
            },
            {
              id: "me",
              label: "Me",
              path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6",
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            aria-label={t.label}
            aria-current={
              (
                t.id === "circles"
                  ? currentScreen === "circles" || currentScreen === "dms"
                  : currentScreen === t.id
              )
                ? "page"
                : undefined
            }
            onClick={() => onNavigate(t.id)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={t.path} />
            </svg>
            {(t.id === "circles"
              ? currentScreen === "circles" || currentScreen === "dms"
              : currentScreen === t.id) && <span>{t.label}</span>}
          </button>
        ))}
      </nav>
      <div className="make-home-indicator" aria-hidden="true" />
      <button
        ref={fab}
        className="make-mo-fab"
        aria-label="Open Mo"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{ left: pos.x, bottom: pos.y, cursor: "grab" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            left: pos.x,
            bottom: pos.y,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const p = e.currentTarget.parentElement;
          if (!d || !p) return;
          if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 6)
            d.moved = true;
          if (d.moved) {
            setOpen(false);
            setPos({
              x: Math.max(
                10,
                Math.min(p.clientWidth - 62, d.left + e.clientX - d.x),
              ),
              y: Math.max(
                20,
                Math.min(p.clientHeight - 62, d.bottom + d.y - e.clientY),
              ),
            });
          }
        }}
        onPointerUp={() => {
          if (drag.current && !drag.current.moved) setOpen((v) => !v);
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onClick={(e) => {
          if (e.detail === 0) setOpen((v) => !v);
        }}
      >
        <span style={{ display: "flex", pointerEvents: "none" }}>
          <Mo
            size={44}
            mood={
              feeling === "over"
                ? "worried"
                : feeling === "ready"
                  ? "happy"
                  : "calm"
            }
          />
        </span>
      </button>
    </>
  );
}
