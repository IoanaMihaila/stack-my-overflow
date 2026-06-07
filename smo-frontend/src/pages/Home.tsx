import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { useAuth } from "../hooks/useAuth";
import { getQuestions } from "../lib/api"; // ✅ Folosim funcția dedicată din api.ts acum

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ STRETCH: Stare pentru tag-ul activ curent selectat ca filtru
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // ✅ STRETCH: Fetch-ul se va declanșa ori de câte ori activeTag se schimbă
useEffect(() => {
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // 🚀 ADAUGĂ ACEST LOG PENTRU DEBUG:
      console.log("Trimit cerere către backend cu tag-ul:", activeTag);

      const response = await getQuestions(activeTag || undefined);
      
      if (response && response.questions) {
        setQuestions(response.questions);
      } else if (Array.isArray(response)) {
        setQuestions(response);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchQuestions();
}, [activeTag]);

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "#64748b", fontFamily: "system-ui" }}>
        <h2>Loading questions...</h2>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        
        <div style={headerRowStyle}>
          <h1 style={titleStyle}>
            {activeTag ? `Questions tagged [${activeTag}]` : "Top Questions"}
          </h1>

          <button
            disabled={!user}
            onClick={() => {
              if (!user) {
                navigate("/signin");
                return;
              }
              navigate("/questions/new");
            }}
            style={{
              ...askButtonStyle,
              opacity: user ? 1 : 0.5,
              cursor: user ? "pointer" : "not-allowed"
            }}
          >
            Ask Question
          </button>
        </div>

        {/* ✅ STRETCH: Indicator vizual de filtru activ deasupra listei */}
        {activeTag && (
          <div style={filterBadgeContainerStyle}>
            <span style={filterLabelStyle}>Filtering by tag:</span>
            <span style={activeTagBadgeStyle}>
              {activeTag}
              <button onClick={() => setActiveTag(null)} style={clearFilterBtnStyle}>
                ×
              </button>
            </span>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "16px" }}>
              {/* ✅ STRETCH: Mesaj diferențiat când nu sunt rezultate pentru un tag specific */}
              {activeTag ? (
                <span>No questions tagged '{activeTag}'.</span>
              ) : (
                <span>No questions found. Be the first to ask!</span>
              )}
            </div>
          ) : (
            questions.map((question) => {
              const summary = {
                id: question.id,
                title: question.title,
                is_solved: question.is_solved,
                vote_count: question.vote_count,
                created_at: question.created_at,
                author: question.author,
                question_tags: question.question_tags,
                answer_count: question.answer_count || 0,
              };

              return (
                <div key={question.id} style={{ position: "relative" }}>
                  {/* ✅ CORECTAT: Trimitem prop-ul onTagClick direct în QuestionCard */}
                  <QuestionCard
                    question={summary}
                    onClick={() => navigate(`/questions/${question.id}`)}
                    onTagClick={(tagName) => setActiveTag(tagName)}
                  />
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

// --- STYLING SUPLIMENTAR PENTRU STRETCH ---
const filterBadgeContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "16px",
  padding: "8px 12px",
  backgroundColor: "#f1f5f9",
  borderRadius: "6px",
  width: "fit-content"
};

const filterLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569"
};

const activeTagBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: "600"
};

const clearFilterBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "16px",
  padding: "0",
  lineHeight: 1,
  fontWeight: "bold"
};

const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};
const containerStyle: React.CSSProperties = { maxWidth: "1100px", margin: "0 auto" };
const headerRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" };
const titleStyle: React.CSSProperties = { fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: 0 };
const askButtonStyle: React.CSSProperties = { backgroundColor: "#3b82f6", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "600", fontSize: "14px", boxShadow: "0 1px 2px rgba(59, 130, 246, 0.15)" };

export default Home;