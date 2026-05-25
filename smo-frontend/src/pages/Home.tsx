import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          author:profiles!author_id(username),
          question_tags(tag:tags(name))
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setQuestions(data || []);
    };

    fetchQuestions();
  }, []);

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        
        <div style={headerRowStyle}>
          <h1 style={titleStyle}>Top Questions</h1>

          <button
            disabled={!user} // <-- Dezactivează butonul nativ dacă user-ul lipsește
            onClick={() => {
              if (!user) {
                navigate("/signin");
                return;
              }
              navigate("/questions/new");
            }}
            style={{
              ...askButtonStyle,
              opacity: user ? 1 : 0.5,         // <-- Schimbă opacitatea dacă e disabled
              cursor: user ? "pointer" : "not-allowed" // <-- Schimbă cursorul
            }}
          >
            Ask Question
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          {questions.map((question) => {
            const summary = {
              id: question.id,
              title: question.title,
              is_solved: question.is_solved,
              vote_count: question.vote_count,
              created_at: question.created_at,
              author: question.author,
              question_tags: question.question_tags,
              answer_count: 0,
            };

            return (
              <QuestionCard
                key={question.id}
                question={summary}
                onClick={() => navigate(`/questions/${question.id}`)}
              />
            );
          })}
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