import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { useAuth } from "../hooks/useAuth";
import { request } from "../lib/api"; // ✅ Schimbat: Importăm helper-ul de backend în loc de Supabase client

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // ✅ Apelăm ruta Express GET /questions prin serverul intermediar
        const response = await request("/questions");
        
        // Backend-ul trimite structura încapsulată în { questions: [...] }
        if (response && response.questions) {
          setQuestions(response.questions);
        } else if (Array.isArray(response)) {
          setQuestions(response);
        }
      } catch (error) {
        console.error("Error fetching questions from Express backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center", color: "#64748b", fontFamily: "system-ui" }}>
        <h2>Loading top questions...</h2>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        
        <div style={headerRowStyle}>
          <h1 style={titleStyle}>Top Questions</h1>

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

        <div style={{ marginTop: "20px" }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              No questions found. Be the first to ask!
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
                // ✅ REPARAT: Citim proprietatea 'answer_count' calculată corect și trimisă de backend!
                answer_count: question.answer_count || 0,
              };

              return (
                <QuestionCard
                  key={question.id}
                  question={summary}
                  onClick={() => navigate(`/questions/${question.id}`)}
                />
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};

const containerStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: "16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
};

const askButtonStyle: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.15)",
};

export default Home;