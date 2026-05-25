import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Question } from "../types";

function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionCompleteData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Preluăm detaliile întrebării împreună cu autorul și tag-urile
        const { data: qData, error: qError } = await supabase
          .from("questions")
          .select(`
            *,
            author:profiles!author_id(id, username),
            question_tags(tag:tags(name))
          `)
          .eq("id", id)
          .single();

        if (qError) throw qError;

        // Preluăm răspunsurile asociate întrebării și autorii lor
        const { data: aData, error: aError } = await supabase
          .from("answers")
          .select(`
            *,
            author:profiles!author_id(id, username)
          `)
          .eq("question_id", id)
          .order("is_accepted", { ascending: false })
          .order("created_at", { ascending: true });

        if (aError) throw aError;

        // Preluăm comentariile pentru această întrebare
        const { data: cData, error: cError } = await supabase
          .from("comments")
          .select(`
            *,
            author:profiles!author_id(username)
          `)
          .eq("target_id", id)
          .eq("target_type", "question")
          .order("created_at", { ascending: true });

        if (cError) throw cError;

        // Asamblăm obiectul complet conform structurii din interfața `Question`
        const fullQuestion: Question = {
          ...qData,
          author: qData.author || null,
          question_tags: qData.question_tags || [],
          // Mapăm răspunsurile adăugând temporar o listă goală de comentarii pentru fiecare
          answer: (aData || []).map((ans: any) => ({
            ...ans,
            author: ans.author || null,
            comments: [], 
          })),
          comments: cData || [],
          allow_ai_companion: false, // Fallback pentru câmpul lipsă din DB, dar cerut în interface
        };

        setQuestion(fullQuestion);
      } catch (err) {
        console.error("Error loading question details:", err);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionCompleteData();
  }, [id]);

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

  return (
    <div style={pageWrapperStyle}>
      <div style={mainContainerStyle}>
        
        {/* NAVIGARE ÎNAPOI */}
        <div style={{ marginBottom: "20px" }}>
          <span onClick={() => navigate("/")} style={backLinkStyle}>
            ← All questions
          </span>
        </div>

        {/* --- HEADER ÎNTREBARE --- */}
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

        {/* --- GRID CORP ÎNTREBARE --- */}
        <div style={contentGridStyle}>
          {/* Sistem Vot Stânga */}
          <div style={voteColStyle}>
            <button style={voteTriangleStyle}>▲</button>
            <span style={voteCountStyle}>{question.vote_count}</span>
            <button style={voteTriangleStyle}>▼</button>
          </div>

          {/* Textul Întrebării, Tag-uri și Comentarii */}
          <div style={bodyColStyle}>
            <p style={descriptionStyle}>{question.description}</p>
            
            {/* Rândul de Tag-uri */}
            <div style={tagRowStyle}>
              {question.question_tags.map((qt, idx) => (
                <span key={idx} style={tagStyle}>
                  {qt.tag.name}
                </span>
              ))}
            </div>

            {/* Comentarii Întrebare */}
            {question.comments && question.comments.length > 0 && (
              <div style={commentSectionStyle}>
                {question.comments.map((comment) => (
                  <div key={comment.id} style={commentItemStyle}>
                    {comment.body} – <span style={commentAuthorStyle}>{comment.author?.username || "anonymous"}</span>
                    <span style={commentDateStyle}> {new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- SECȚIUNE RĂSPUNSURI --- */}
        <div style={answersCountStyle}>
          {question.answer.length} {question.answer.length === 1 ? "Answer" : "Answers"}
        </div>

        {question.answer.map((ans) => (
          <div 
            key={ans.id} 
            style={{
              ...answerCardStyle,
              border: ans.is_accepted ? "1px solid #4ade80" : "1px solid #e2e8f0",
              backgroundColor: ans.is_accepted ? "#f0fdf4" : "#ffffff"
            }}
          >
            <div style={contentGridStyle}>
              {/* Voturi Răspuns + Bifă Mare Verde */}
              <div style={voteColStyle}>
                <button style={voteTriangleStyle}>▲</button>
                <span style={voteCountStyle}>{ans.vote_count}</span>
                <button style={voteTriangleStyle}>▼</button>
                {ans.is_accepted && <div style={acceptedCheckStyle}>✓</div>}
              </div>

              {/* Conținut Răspuns */}
              <div style={bodyColStyle}>
                {/* Rândul de Badges */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "15px", flexWrap: "wrap" }}>
                  {ans.is_accepted && (
                    <span style={acceptedLabelStyle}>ACCEPTED ANSWER</span>
                  )}
                  {ans.is_ai_generated && (
                    <span style={aiCompanionLabelStyle}>✦ AI Companion</span>
                  )}
                </div>

                <h3 style={answerTitleStyle}>{ans.body.split('\n')[0]}</h3>
                <p style={answerBodyStyle}>{ans.body}</p>

                {/* Comentarii Răspuns */}
                {ans.comments && ans.comments.length > 0 && (
                  <div style={commentSectionStyle}>
                    {ans.comments.map((c) => (
                      <div key={c.id} style={commentItemStyle}>
                        {c.body} – <span style={commentAuthorStyle}>{c.author?.username || "anonymous"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

// --- DESIGN SYSTEM STYLE DICTIONARY (Rămâne neschimbat) ---
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

export default QuestionDetail;