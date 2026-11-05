// app/src/components/ErrorRetry.tsx
// Error state component with retry button. Uses .why-box card styling.
// Displayed when API calls fail (FRONTEND-08).
interface ErrorRetryProps {
  error: string;
  onRetry: () => void;
}

export function ErrorRetry({ error, onRetry }: ErrorRetryProps) {
  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div className="why-box" style={{ maxWidth: '400px' }}>
        <strong>⚠ Couldn't load</strong>
        <span>{error}</span>
        <button className="secondary-action" onClick={onRetry} style={{ marginTop: '12px' }}>
          Try again
        </button>
      </div>
    </div>
  );
}
