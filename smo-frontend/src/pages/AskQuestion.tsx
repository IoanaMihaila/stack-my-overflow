import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { aiHealth, suggestTags } from "../lib/api"; // Importăm funcțiile adăugate în api.ts

function AskQuestion() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Stări noi pentru logica de "Tag-uri ca pe Stack Overflow"
  const [tags, setTags] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Stări noi pentru temă — Gestionarea AI-ului
  const [aiDisabled, setAiDisabled] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);

  // Pasul 3 din temă: Verificăm starea serviciului AI la montarea componentei
  useEffect(() => {
    async function checkAiStatus() {
      try {
        const health = await aiHealth();
        // AI este utilizabil doar dacă ok este true și rateLimited este fals/falsy
        if (!health || !health.ok || health.rateLimited) {
          setAiDisabled(true);
        }
      } catch (err) {
        // Dacă microserviciul este oprit complet, apelul va arunca eroare -> dezactivăm politicos
        setAiDisabled(true);
      }
    }
    checkAiStatus();
  }, []);

// Pasul 2 din temă: Funcția de generare a tag-urilor prin AI
  const handleGenerateTags = async () => {
    if (!title.trim() || aiDisabled || generatingTags) return;

    try {
      setGeneratingTags(true);
      const result = await suggestTags(title.trim());
      
      if (result && result.tags) {
        setTags((prevTags) => {
          // Soluție defensivă robustă: Extrage string-ul indiferent dacă e array pur sau structură [{tag: 'valoare'}]
          const cleanNewTags = result.tags
            .filter((t: any) => t !== null && t !== undefined)
            .map((t: any) => {
              if (typeof t === 'object' && 'tag' in t) {
                return String(t.tag).trim().toLowerCase();
              }
              return String(t).trim().toLowerCase();
            });

          // Creăm o listă unică combinând tag-urile vechi cu cele noi curățate (deduplicate)
          const combined = Array.from(new Set([...prevTags, ...cleanNewTags]));
          
          // Ne asigurăm că nu depășim limita impusă de aplicație (maxim 5 tag-uri)
          return combined.slice(0, 5);
        });
      }
    } catch (error: any) {
      console.error("AI tag generation failed:", error);
      
      // ✅ REPARAT: Prinde eroarea de rate limit indiferent dacă e trimisă ca cod 429 sau ca text ("too_many_requests")
      const errorMessage = error?.message || "";
      if (
        errorMessage.includes("429") || 
        errorMessage.includes("too_many_requests") || 
        errorMessage.includes("groq_rate_limited") ||
        errorMessage.includes("rate-limited")
      ) {
        setAiDisabled(true);
      }
    } finally {
      setGeneratingTags(false);
    }
  };

  // Gestionează apăsarea tastelor Enter, Comma sau Space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault(); // Oprim trimiterea form-ului la Enter
      
      const trimmedValue = currentInput.trim().toLowerCase().replace(/,/g, "");
      
      if (trimmedValue) {
        // Limităm la maximum 5 tag-uri (stilul Stack Overflow) și evităm duplicatele
        if (tags.length >= 5) {
          alert("You can add up to 5 tags only.");
          setCurrentInput("");
          return;
        }
        
        if (!tags.includes(trimmedValue)) {
          setTags([...tags, trimmedValue]);
        }
      }
      setCurrentInput(""); // Resetăm inputul text
    }
  };

  // Permite utilizatorului să șteargă un tag dacă apasă pe "x"
  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to ask a question.");
      navigate("/signin");
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert("Title and Description cannot be empty.");
      return;
    }

    try {
      setLoading(true);

      // 1. Inserăm întrebarea în tabela 'questions'
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          title: title.trim(),
          description: description.trim(),
          author_id: user.id,
          is_solved: false,
          vote_count: 0,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      const newQuestionId = questionData.id;

      // 2. Procesăm tag-urile confirmate din array-ul `tags`
      if (tags.length > 0) {
        const tagsToUpsert = tags.map((name) => ({ name }));

        // Upsert în tabela master 'tags'
        const { data: upsertedTagsData, error: tagsError } = await supabase
          .from("tags")
          .upsert(tagsToUpsert, { onConflict: "name" })
          .select();

        if (tagsError) throw tagsError;

        // 3. Creăm legăturile în tabela junction 'question_tags'
        if (upsertedTagsData) {
          const questionTagsRows = upsertedTagsData.map((tag) => ({
            question_id: newQuestionId,
            tag_id: tag.id,
          }));

          const { error: junctionError } = await supabase
            .from("question_tags")
            .insert(questionTagsRows);

          if (junctionError) throw junctionError;
        }
      }

      navigate("/");
    } catch (error: any) {
      console.error("Error creating question:", error);
      alert(error.message || "An error occurred while posting your question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Ask a Public Question</h1>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>Title</label>
            <p style={hintStyle}>Be specific and imagine you’re asking a question to another person.</p>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="e.g. How to pass data between siblings in React?"
                style={{ ...inputStyle, flex: 1 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
              
              {/* Pasul 2 și 3: Butonul de generat tag-uri cu AI, vizibil doar când AI este up */}
              {!aiDisabled && (
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  disabled={loading || generatingTags || !title.trim()}
                  style={{
                    ...aiButtonStyle,
                    opacity: (!title.trim() || generatingTags) ? 0.5 : 1,
                    cursor: (!title.trim() || generatingTags) ? "not-allowed" : "pointer"
                  }}
                >
                  {generatingTags ? "✦ Generating tags..." : "✦ Generate tags"}
                </button>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <p style={hintStyle}>Introduce the problem and expand on what you put in the title.</p>
            <textarea
              placeholder="Provide all the details someone would need to answer your question..."
              style={textareaStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              rows={8}
            />
          </div>

          <div>
            <label style={labelStyle}>Tags</label>
            <p style={hintStyle}>Type a tag name and press <strong>Enter</strong>, <strong>Comma</strong> or <strong>Space</strong> to add it.</p>
            
            {/* Container stilizat pentru input + tag-urile sub formă de badge */}
            <div style={tagsContainerInputStyle}>
              {tags.map((tag, idx) => (
                <span key={idx} style={tagBadgeStyle}>
                  {tag}
                  <button type="button" onClick={() => removeTag(idx)} style={removeTagBtnStyle}>
                    ×
                  </button>
                </span>
              ))}
              
              <input
                type="text"
                placeholder={tags.length === 0 ? "e.g. react, typescript" : ""}
                style={inlineInputStyle}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Posting..." : "Post Your Question"}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- STYLES ---
const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "calc(100vh - 70px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "40px 20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const boxStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "700px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "32px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "24px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "2px",
};

const hintStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  margin: "0 0 8px 0",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
  color: "#0f172a",
  outline: "none",
};

const aiButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f0fdf4",
  color: "#166534",
  fontWeight: "600",
  fontSize: "13px",
  whiteSpace: "nowrap",
  transition: "all 0.2s",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
  color: "#0f172a",
  fontFamily: "inherit",
  outline: "none",
  resize: "vertical",
};

const tagsContainerInputStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  alignItems: "center",
  width: "100%",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#fff",
  boxSizing: "border-box",
};

const inlineInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: "120px",
  border: "none",
  outline: "none",
  fontSize: "14px",
  padding: "4px 0",
  color: "#0f172a",
};

const tagBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: "#e0f2fe",
  color: "#0369a1",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: "500",
};

const removeTagBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0369a1",
  cursor: "pointer",
  fontSize: "16px",
  padding: "0 2px",
  lineHeight: 1,
  fontWeight: "bold",
};

const buttonStyle: React.CSSProperties = {
  width: "fit-content",
  padding: "12px 20px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#3b82f6",
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  marginTop: "8px",
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.2)",
};

export default AskQuestion;