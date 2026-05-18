interface TagPillProps {
  tag: string;
  onRemove?: () => void;
}

function TagPill({ tag, onRemove }: TagPillProps) {
  return (
    <div style={pillStyle}>
      <span style={textStyle}>{tag}</span>

      {onRemove && (
        <button
          onClick={onRemove}
          style={removeButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          ×
        </button>
      )}
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#f1f5f9", // Gri foarte deschis modern
  border: "1px solid #e2e8f0",
  padding: "4px 10px",
  borderRadius: "6px", // Rotunjire fină potrivită cu design-ul general
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};

const textStyle: React.CSSProperties = {
  color: "#475569", // Slate text
  fontSize: "13px",
  fontWeight: "500",
};

const removeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "16px",
  padding: 0,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
  transition: "color 0.1s ease",
};

export default TagPill;