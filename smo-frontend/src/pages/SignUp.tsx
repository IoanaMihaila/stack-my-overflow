import React, { useState } from "react";
import { supabase } from "../lib/supabase";

function SignUp() {
  const [chosenUsername, setChosenUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create auth user cu metadata (username)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: chosenUsername, // <-- Transmitem username-ul către Supabase Auth
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Dacă utilizatorul a fost inițializat cu succes în Auth
    if (data.user) {
      // Pop-up cerut de tine
      alert("Verify your email to confirm your identity");
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>
          Join the community to ask questions and find answers.
        </p>

        <form onSubmit={handleSignUp} style={formStyle}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              placeholder="e.g. johndoe"
              style={inputStyle}
              value={chosenUsername}
              onChange={(e) => setChosenUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "calc(100vh - 70px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const boxStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "400px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "32px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 4px 0",
  textAlign: "center",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 24px 0",
  textAlign: "center",
  lineHeight: "1.4",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500",
  color: "#475569",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  color: "#0f172a",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
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

export default SignUp;