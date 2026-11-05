// app/src/components/LoadingSpinner.tsx
// Centered 24px circular loading spinner. Uses var(--ink) stroke color.
// Displayed during async data fetches (FRONTEND-07).
export function LoadingSpinner({ size = 24 }: { size?: number } = {}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <svg
        className="loading-spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
      </svg>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          animation: spin 1s linear infinite !important;
        }
      `}</style>
    </div>
  );
}
