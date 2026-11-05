// app/src/components/EmptyState.tsx
// Empty state component with optional action button.
// Displayed when lists are empty (no events, no messages, etc.).
import React from 'react';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      color: 'var(--muted)',
      fontSize: '16px',
      lineHeight: '1.45',
    }}>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button className="secondary-action" onClick={onAction} style={{ marginTop: '16px' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
