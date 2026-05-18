import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TagPill from "../components/TagPill";

function AskQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Stare pentru erori
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  function normalizeTag(tag: string) {
    return tag.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function addTag() {
    const normalized = normalizeTag(tagInput);
    if (!normalized) return;

    // Prevenim duplicatele (Cerință: "Adding the same tag twice has no effect")
    if (tags.includes(normalized)) {
      setTagInput("");
      return;
    }

    setTags([...tags, normalized]);
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Cerință: Enter sau comma adaugă tag-ul ca pastilă detașabilă
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // OPREȘTE trimiterea accidentală a formularului!
      addTag();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Oprește reîmprospătarea paginii în browser

    const newErrors = {
      title: "",
      description: "",
    };

    let hasError = false;

    // 1. Validare Titlu (Required)
    if (!title.trim()) {
      newErrors.title = "Title is required.";
      hasError = true;
    }

    // 2. Validare Descriere (Required + lungime minimă de 20 caractere)
    if (!description.trim()) {
      newErrors.description = "Description is required.";
      hasError = true;
    } else if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters long.";
      hasError = true;
    }

    // Actualizăm starea de erori (Cerință: afișare inline sub câmpuri)
    setErrors(newErrors);

    // Dacă avem vreo eroare, blocăm execuția aici
    if (hasError) return;

    // Cerință: Când ambele câmpuri sunt valide, logăm obiectul în consolă
    console.log({
      title,
      description,
      tags,
    });

    // Opțional: Resetăm formularul după un submit reușit
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    
    // Ne întoarcem pe prima pagină
    navigate("/");
  }

  return (
    <div style={pageWrapperStyle}>
      <div style={formContainerStyle}>
        <h1 style={formTitleStyle}>Ask a public question</h1>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* TITLE */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Title</label>
            <span style={hintStyle}>Be specific and imagine you’re asking a question to another person.</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Is there an R function for finding the index of an element?"
              style={{
                ...inputStyle,
                borderColor: errors.title ? "#ef4444" : "#cbd5e1" // Se colorează în roșu la eroare
              }}
            />
            {/* Eroare inline Titlu */}
            {errors.title && (
              <p style={errorTextStyle}>{errors.title}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>What are the details of your problem?</label>
            <span style={hintStyle}>Introduce the problem and expand on what you put in the title. Minimum 20 characters.</span>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your problem in detail. Markdown is supported. Include what you've already tried."
              style={{ 
                ...inputStyle, 
                resize: "vertical",
                borderColor: errors.description ? "#ef4444" : "#cbd5e1" // Se colorează în roșu la eroare
              }}
            />
            {/* Eroare inline Descriere */}
            {errors.description && (
              <p style={errorTextStyle}>{errors.description}</p>
            )}
          </div>

          {/* TAGS */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tags</label>
            <span style={hintStyle}>Add up to 5 tags to describe what your question is about. Press Enter or comma.</span>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="e.g. (react-router, typescript, node.js)"
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              {tags.map((tag) => (
                <TagPill 
                  key={tag} 
                  tag={tag} 
                  onRemove={() => setTags(tags.filter((t) => t !== tag))} 
                />
              ))}
            </div>
          </div>

          <button type="submit" style={submitButtonStyle}>
            Post your question
          </button>
        </form>
      </div>
    </div>
  );
}

// Stiluri pentru Designul Light Mode stabilit anterior
const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};

const formContainerStyle: React.CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
};

const formTitleStyle: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#0f172a",
  marginBottom: "24px",
};

const formStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "30px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "4px",
};

const hintStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#64748b",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const errorTextStyle: React.CSSProperties = {
  color: "#ef4444",
  fontSize: "13px",
  margin: "6px 0 0 0",
  fontWeight: "500",
};

const submitButtonStyle: React.CSSProperties = {
  backgroundColor: "#3b82f6",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  alignSelf: "flex-start",
};

export default AskQuestion;