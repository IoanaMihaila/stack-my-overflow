import type { QuestionSummary } from "../types";

interface QuestionCardProps {
  question: QuestionSummary;
  onClick?: () => void;
}

function QuestionCard({ question, onClick }: QuestionCardProps) {
  // ⚠️ TRUC DE SIGURANȚĂ: Calculăm dinamic numărul de răspunsuri indiferent de cum îl trimite backend-ul
  // Verifică proprietatea calculată, array-ul de răspunsuri la plural, array-ul la singular sau agregarea brută.
  const rawAnswers = (question as any).answers || (question as any).answer || [];
  
  const totalAnswers = typeof question.answer_count === "number" && question.answer_count > 0 
    ? question.answer_count 
    : (Array.isArray(rawAnswers) && typeof rawAnswers[0]?.count === "number" 
        ? rawAnswers[0].count 
        : (Array.isArray(rawAnswers) ? rawAnswers.length : 0));

  return (
    <div
      onClick={onClick}
      style={cardStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "#cbd5e1";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.01)";
      }}
    >
      <div style={headerRowStyle}>
        <h2 style={titleStyle}>{question.title}</h2>
        {question.is_solved ? (
          <span style={solvedBadgeStyle}>Solved</span>
        ) : (
          <span style={unsolvedBadgeStyle}>Open</span>
        )}
      </div>

      <div style={statsRowStyle}>
        <div style={statItemStyle}>
          <span style={statNumberStyle}>{question.vote_count || 0}</span>
          <span style={statLabelStyle}>votes</span>
        </div>
        <div style={statItemStyle}>
          {/* CORECTAT: Afișăm numărul calculat dinamic totalAnswers */}
          <span style={{ ...statNumberStyle, color: totalAnswers > 0 ? "#16a34a" : "#475569" }}>
            {totalAnswers}
          </span>
          <span style={statLabelStyle}>answers</span>
        </div>
      </div>

      <div style={footerRowStyle}>
        <div style={tagRowStyle}>
          {/* Adăugat fallback-ul || [] și optional chaining ?. pentru a preveni orice crash */}
          {(question.question_tags || []).map((qt: any, idx: number) => (
            <span
              key={idx}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              {qt.tag?.name || qt.tag_name || "tag"}
            </span>
          ))}
        </div>
        
        <div style={metaStyle}>
          asked by <span style={authorStyle}>{question.author?.username || "anonymous"}</span> • {question.created_at ? new Date(question.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.01)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  margin: 0,
  lineHeight: "1.4",
};

const solvedBadgeStyle: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#16a34a",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
};

const unsolvedBadgeStyle: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "500",
};

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginBottom: "16px",
};

const statItemStyle: React.CSSProperties = {
  display: "flex",
  gap: "4px",
  fontSize: "13px",
};

const statNumberStyle: React.CSSProperties = {
  fontWeight: "600",
  color: "#0f172a",
};

const statLabelStyle: React.CSSProperties = {
  color: "#64748b",
};

const footerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
};

const metaStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
};

const authorStyle: React.CSSProperties = {
  color: "#334155",
  fontWeight: "500",
};

export default QuestionCard;