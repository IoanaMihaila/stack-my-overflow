import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; 
import { request } from "../lib/api"; 
import type { Question } from "../types";
import { VoteButton } from "../components/VoteButton";

function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newAnswerBody, setNewAnswerBody] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Încărcarea datelor se face acum securizat prin Express Backend rute
  const fetchQuestionCompleteData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await request(`/questions/${id}`);
      
      if (data && data.question) {
        // Aliniem structura cu tipurile din types.ts (proprietatea .answer la singular)
        const formattedQuestion: Question = {
          ...data.question,
          answer: data.question.answers || data.question.answer || [],
          question_tags: data.question.question_tags || []
        };
        setQuestion(formattedQuestion);
      }
    } catch (err) {
      console.error("Error loading question details via backend middleware:", err);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  let isCurrentRequest = true; // Flag pentru a ignora apelurile vechi care întârzie

  const loadData = async () => {
    if (!id) return;
    try {
      // Pornim încărcarea doar dacă request-ul curent este cel activ
      if (isCurrentRequest) {
        setLoading(true);
      }
      
      const data = await request(`/questions/${id}`);
      
      // Dacă utilizatorul a apucat deja să voteze între timp sau useEffect-ul s-a curățat, ignorăm rezultatul învechit
      if (data && data.question && isCurrentRequest) {
        const formattedQuestion: Question = {
          ...data.question,
          answer: data.question.answers || data.question.answer || [],
          question_tags: data.question.question_tags || []
        };
        setQuestion(formattedQuestion);
      }
    } catch (err) {
      console.error("Error loading question details:", err);
      if (isCurrentRequest) setQuestion(null);
    } finally {
      if (isCurrentRequest) {
        setLoading(false);
      }
    }
  };

  loadData();

  // Funcția de cleanup: când React 18 omoară primul montaj din StrictMode, 
  // flag-ul devine false, iar primul request (cel întârziat) nu va mai suprascrie ecranul!
  return () => {
    isCurrentRequest = false;
  };
}, [id]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerBody.trim() || !id) return;

    try {
      setSubmittingAnswer(true);
      await request(`/questions/${id}/answers`, {
        method: "POST",
        body: JSON.stringify({ body: newAnswerBody })
      });

      setNewAnswerBody(""); 
      alert("Answer posted successfully!");
      await fetchQuestionCompleteData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to post the answer. Please try again.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // IMPLEMENTAT: Callback-ul asincron trimis către componenta de vot (Part 2)
// În QuestionDetail.tsx:
  const handleQuestionVote = async (value: 1 | -1) => {
    if (!id || !question) return;
    
    try {
      const response = await request(`/questions/${id}/vote`, {
        method: "PATCH",
        body: JSON.stringify({ value })
      });

      // Verificăm răspunsul de la backend (care acum returnează snake_case 'vote_count')
      if (response && typeof response.vote_count === "number") {
        setQuestion(prev => {
          if (!prev) return null;
          return {
            ...prev,
            vote_count: response.vote_count
          };
        });
      }
    } catch (err) {
      console.error("Failed to sync vote with backend:", err);
      // Aruncăm eroarea mai departe pentru ca componenta VoteButton să poată rula rollback-ul optimist automat!
      throw err; 
    }
  };

  // IMPLEMENTAT: Acceptare răspuns (Part 1)
  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await request(`/answers/${answerId}/accept`, {
        method: "PATCH"
      });
      alert("Answer marked as accepted!");
      await fetchQuestionCompleteData(); 
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to accept the answer.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "#64748b", fontFamily: "system-ui" }}>
        <h2>Loading question details...</h2>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "#64748b", fontFamily: "system-ui" }}>
        <h2>Question not found</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "15px", cursor: "pointer", padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
          Go Home
        </button>
      </div>
    );
  }

  const isQuestionAuthor = user && question.author_id === user.id;

  return (
    <div style={pageWrapperStyle}>
      <div style={mainContainerStyle}>
        
        <div style={{ marginBottom: "20px" }}>
          <span onClick={() => navigate("/")} style={backLinkStyle}>
            ← All questions
          </span>
        </div>

        <header style={headerStyle}>
          <div style={titleRowStyle}>
            <h1 style={titleStyle}>{question.title}</h1>
            {question.is_solved && <span style={solvedBadgeStyle}>Solved</span>}
          </div>
          
          <div style={metaBarStyle}>
            <span>asked by <strong style={metaAuthorStyle}>{question.author?.username || "anonymous"}</strong></span>
            <span style={metaDividerStyle}>•</span>
            <span>{new Date(question.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </header>

        <div style={contentGridStyle}>
          {/* Conectăm componenta VoteButton la numărul reactiv și la callback-ul nostru de API */}
          <VoteButton count={question.vote_count || 0} onVote={handleQuestionVote} />

          <div style={bodyColStyle}>
            <p style={descriptionStyle}>{question.description}</p>
            
            <div style={tagRowStyle}>
              {(question.question_tags || []).map((qt: any, idx: number) => (
                <span key={idx} style={tagStyle}>
                  {qt.tag?.name || qt.tag_name || "tag"}
                </span>
              ))}
            </div>

            {question.comments && question.comments.length > 0 && (
              <div style={commentSectionStyle}>
                {question.comments.map((comment: any) => (
                  <div key={comment.id} style={commentItemStyle}>
                    {comment.body} – <span style={commentAuthorStyle}>{comment.author?.username || "anonymous"}</span>
                    <span style={commentDateStyle}> {new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={answersCountStyle}>
          {(question.answer || []).length} {(question.answer || []).length === 1 ? "Answer" : "Answers"}
        </div>

        {(question.answer || []).map((ans: any) => (
          <div 
            key={ans.id} 
            style={{
              ...answerCardStyle,
              border: ans.is_accepted ? "1px solid #4ade80" : "1px solid #e2e8f0",
              backgroundColor: ans.is_accepted ? "#f0fdf4" : "#ffffff"
            }}
          >
            <div style={contentGridStyle}>
              {/* Răspunsurile folosesc butoane statice conform instrucțiunilor (nu au rută de vot dedicate răspunsurilor) */}
              <div style={voteColStyle}>
                <button style={{ ...voteTriangleStyle, cursor: "not-allowed" }}>▲</button>
                <span style={voteCountStyle}>{ans.vote_count || 0}</span>
                <button style={{ ...voteTriangleStyle, cursor: "not-allowed" }}>▼</button>
                {ans.is_accepted && <div style={acceptedCheckStyle}>✓</div>}
              </div>

              <div style={bodyColStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {ans.is_accepted && <span style={acceptedLabelStyle}>ACCEPTED ANSWER</span>}
                    {ans.is_ai_generated && <span style={aiCompanionLabelStyle}>✦ AI Companion</span>}
                  </div>
                  
                  {/* Butonul de acceptare se randează doar pentru cel care a pus întrebarea */}
                  {isQuestionAuthor && !ans.is_accepted && (
                    <button 
                      onClick={() => handleAcceptAnswer(ans.id)}
                      style={acceptAnswerButtonStyle}
                    >
                      Accept Answer
                    </button>
                  )}
                </div>

                <p style={answerBodyStyle}>{ans.body}</p>
                <div style={{ marginTop: "12px", fontSize: "13px", color: "#64748b" }}>
                  answered by <strong>{ans.author?.username || "anonymous"}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "40px", borderTop: "1px solid #e2e8f0", paddingTop: "30px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>
            Your Answer
          </h2>
          
          {user ? (
            <form onSubmit={handleAnswerSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <textarea
                rows={6}
                placeholder="Write your answer here in detail..."
                value={newAnswerBody}
                onChange={(e) => setNewAnswerBody(e.target.value)}
                required
                disabled={submittingAnswer}
                style={textareaStyle}
              />
              <div>
                <button
                  type="submit"
                  disabled={submittingAnswer || !newAnswerBody.trim()}
                  style={{
                    ...submitAnswerButtonStyle,
                    opacity: (submittingAnswer || !newAnswerBody.trim()) ? 0.6 : 1,
                    cursor: (submittingAnswer || !newAnswerBody.trim()) ? "not-allowed" : "pointer"
                  }}
                >
                  {submittingAnswer ? "Posting..." : "Post Your Answer"}
                </button>
              </div>
            </form>
          ) : (
            <div style={authAlertBoxStyle}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                You must be logged in to answer this question.{" "}
                <Link to="/signin" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
                  Sign In here
                </Link>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// --- DESIGN SYSTEM STYLE DICTIONARY ---
const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#1e293b",
};

const mainContainerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const backLinkStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  cursor: "pointer",
  textDecoration: "none",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "25px",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "10px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
};

const solvedBadgeStyle: React.CSSProperties = {
  backgroundColor: "#dcfce7",
  color: "#15803d",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500",
};

const metaBarStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
};

const metaAuthorStyle: React.CSSProperties = {
  color: "#475569",
};

const metaDividerStyle: React.CSSProperties = {
  margin: "0 8px",
  color: "#cbd5e1",
};

const contentGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px 1fr",
  gap: "24px",
  marginBottom: "20px",
};

const voteColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
  paddingTop: "4px",
};

const voteTriangleStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#cbd5e1",
  fontSize: "20px",
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

const voteCountStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#334155",
};

const bodyColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#334155",
  margin: "0 0 20px 0",
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const tagStyle: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  color: "#475569",
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "13px",
};

const commentSectionStyle: React.CSSProperties = {
  borderTop: "1px dashed #e2e8f0",
  marginTop: "15px",
  paddingTop: "5px",
};

const commentItemStyle: React.CSSProperties = {
  fontSize: "13px",
  padding: "8px 0",
  color: "#475569",
  borderBottom: "1px solid #f1f5f9",
};

const commentAuthorStyle: React.CSSProperties = {
  color: "#2563eb",
};

const commentDateStyle: React.CSSProperties = {
  color: "#94a3b8",
  marginLeft: "6px",
};

const answersCountStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0f172a",
  marginTop: "40px",
  marginBottom: "20px",
};

const answerCardStyle: React.CSSProperties = {
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const acceptedCheckStyle: React.CSSProperties = {
  color: "#22c55e",
  fontSize: "24px",
  fontWeight: "bold",
  marginTop: "12px",
};

const acceptedLabelStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const aiCompanionLabelStyle: React.CSSProperties = {
  color: "#a855f7",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.5px",
};

const answerTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0 0 12px 0",
};

const answerBodyStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#334155",
  margin: 0,
  whiteSpace: "pre-wrap"
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  lineHeight: "1.5",
  fontFamily: "inherit",
  boxSizing: "border-box",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  outlineColor: "#3b82f6",
};

const submitAnswerButtonStyle: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.2)",
  transition: "all 0.15s ease",
};

const acceptAnswerButtonStyle: React.CSSProperties = {
  backgroundColor: "#22c55e",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "12px",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(34, 197, 94, 0.2)",
};

const authAlertBoxStyle: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1e40af",
  padding: "16px",
  borderRadius: "8px",
};

export default QuestionDetail;