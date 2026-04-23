import { useEffect, useRef, useState } from "react";
import { Event } from "../types";
import { isOnlineEvent, truncateToSentences } from "../utils/eventHelpers";
import { formatEventTime } from "../utils/dateFormatters";
import { getShortCategoryName } from "../utils/categoryUtils";

interface Props {
  event: Event;
  userLikes: string[];
  userBookmarks: string[];
  onLike: (eventId: string) => void;
  onBookmark: (eventId: string) => void;
  categories: string[];
  siblings?: Event[];
  onSwitchEvent?: (event: Event) => void;
}

export default function EventDetailBody({
  event,
  userLikes,
  userBookmarks,
  onLike,
  onBookmark,
  categories,
  siblings = [],
  onSwitchEvent,
}: Props) {
  const [showFull, setShowFull] = useState(false);
  const descriptionScrollRef = useRef<HTMLDivElement | null>(null);
  const liked = userLikes.includes(event.eventId);
  const bookmarked = userBookmarks.includes(event.eventId);
  const truncated = truncateToSentences(event.description, 3, 240);
  const hasMore = truncated.length < event.description.trim().length;
  const hasSiblings = siblings.length > 1 && !!onSwitchEvent;

  useEffect(() => {
    if (showFull && descriptionScrollRef.current) {
      descriptionScrollRef.current.scrollTop = 0;
    }
  }, [showFull, event.eventId]);

  return (
    <div>
      <h2 style={{ margin: "0 0 10px 0", fontSize: "20px", lineHeight: "1.3" }}>
        {event.name}
        {isOnlineEvent(event) && (
          <span
            style={{
              fontSize: "12px",
              marginLeft: "8px",
              padding: "3px 7px",
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: "4px",
              verticalAlign: "middle",
            }}
          >
            ONLINE
          </span>
        )}
      </h2>

      {hasSiblings && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "14px",
            padding: "8px 10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#6c757d", marginRight: "4px" }}>
            {siblings.length} events here:
          </span>
          {siblings.map((sib) => {
            const active = sib.eventId === event.eventId;
            return (
              <button
                key={sib.eventId}
                onClick={() => onSwitchEvent!(sib)}
                title={sib.name}
                style={{
                  padding: "3px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  cursor: active ? "default" : "pointer",
                  backgroundColor: active ? "#8B2A2A" : "white",
                  color: active ? "white" : "#212529",
                  border: `1px solid ${active ? "#8B2A2A" : "#ced4da"}`,
                  maxWidth: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {sib.name}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={descriptionScrollRef}
        style={{
          marginBottom: "16px",
          ...(showFull && hasMore
            ? {
              maxHeight: "260px",
              overflowY: "auto",
              paddingRight: "6px",
              border: "1px solid #eee",
              borderRadius: "4px",
              padding: "10px",
            }
            : {}),
        }}
      >
        <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
          {showFull || !hasMore ? event.description : truncated}
          {hasMore && (
            <button
              onClick={() => setShowFull(!showFull)}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                padding: "0 4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {showFull ? "Show Less" : "Show More"}
            </button>
          )}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "8px 12px",
          fontSize: "14px",
          marginBottom: "16px",
        }}
      >
        <strong>Location:</strong>
        <span>{event.location || "—"}</span>
        <strong>Time:</strong>
        <span>
          {event.startTime ? formatEventTime(event.startTime) : "No date available"}
        </span>
        <strong>Categories:</strong>
        <span>
          {categories.length > 0
            ? categories.map((c) => getShortCategoryName(c)).join(", ")
            : "—"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #eee",
          paddingTop: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <span style={{ marginRight: "15px", fontSize: "14px" }}>
            👁️ {event.viewedCount}
          </span>
          <button
            onClick={() => onLike(event.eventId)}
            style={{
              padding: "6px 12px",
              backgroundColor: liked ? "#dc3545" : "#f8f9fa",
              color: liked ? "white" : "#212529",
              border: liked ? "none" : "1px solid #ced4da",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {liked ? "❤️" : "👍"} {event.likedCount}
          </button>
        </div>

        <button
          onClick={() => onBookmark(event.eventId)}
          style={{
            padding: "6px 12px",
            backgroundColor: bookmarked ? "#dc3545" : "#f8f9fa",
            color: bookmarked ? "white" : "#212529",
            border: bookmarked ? "none" : "1px solid #ced4da",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {bookmarked ? "Bookmarked" : "🏷️ Bookmark"}
        </button>
      </div>

      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          Open Event Page
        </a>
      )}
    </div>
  );
}
