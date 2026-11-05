// The Make Circles/Messages segmented header is shared so both destinations stay aligned.
export function CommunityHeader({
  tab,
  onCircles,
  onMessages,
}: {
  tab: "circles" | "dms";
  onCircles: () => void;
  onMessages: () => void;
}) {
  return (
    <div className="tab-sticky-header">
      <h1 className="tab-page-title">Circles</h1>
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
