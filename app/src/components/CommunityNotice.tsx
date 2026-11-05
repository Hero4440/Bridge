// Calm shared connection, retry, and save states for the three community screens.
export function CommunityNotice({
  error,
  online,
  onRetry,
}: {
  error?: string;
  online: boolean;
  onRetry?: () => void;
}) {
  return (
    <>
      {!online && (
        <div className="community-notice" role="status">
          You’re offline. Your draft is still here. Reconnect to save or send.
        </div>
      )}
      {error && (
        <div className="community-notice community-error" role="alert">
          <span>{error}</span>
          {onRetry && (
            <button onClick={onRetry} disabled={!online}>
              Try again
            </button>
          )}
        </div>
      )}
    </>
  );
}
