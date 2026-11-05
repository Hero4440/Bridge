// The Make Circles/Messages segmented header is shared so both destinations stay aligned.
export function CommunityHeader({
  tab,
  onCircles,
  onMessages,
  onEvents,
}: {
  tab: "circles" | "dms";
  onCircles: () => void;
  onMessages: () => void;
  onEvents?: () => void;
}) {
  return (
    <div className="tab-sticky-header">
      <div className="community-title">
        <h1 className="tab-page-title">Circles</h1>
        {onEvents && (
          <button className="community-events" onClick={onEvents}>
            Events →
          </button>
        )}
      </div>
      <div
        className="community-tabs"
        role="tablist"
        aria-label="Community views"
      >
        <button
          role="tab"
          aria-selected={tab === "circles"}
          onClick={onCircles}
        >
          Circles
        </button>
        <button role="tab" aria-selected={tab === "dms"} onClick={onMessages}>
          Messages
        </button>
      </div>
    </div>
  );
}
