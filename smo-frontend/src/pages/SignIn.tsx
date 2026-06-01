import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [usernameOrEmail, setUsernameOrEmail] = useState(""); // Redenumit starea pentru claritate
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Pasăm starea redenumită către hook
      const data = await login(usernameOrEmail, password);

      if (data && data.user) {
        alert("Signed in successfully!");
        navigate("/"); 
      }
    } catch (error: any) {
      console.error("Eroare la Sign In:", error);
      setErrorMsg(error.message || "Username/Email sau parolă incorectă.");
      alert(error.message || "Eroare la autentificare.");
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={boxStyle}>
        <h1 style={titleStyle}>Sign In</h1>

        <p style={subtitleStyle}>
          Welcome back! Please enter your details.
        </p>

        {errorMsg && (
          <p style={{ color: "#ef4444", fontSize: "14px", textAlign: "center", marginBottom: "16px" }}>
            {errorMsg}
          </p>
        )}

        <form
          onSubmit={handleSignIn}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            {/* CORECTAT TEXTUL ETICHETEI */}
            <label style={labelStyle}>Username or Email</label>
            <input
              type="text" // Schimbat din "email" în "text" ca să accepte caractere fără @
              placeholder="your_username or you@example.com"
              style={inputStyle}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
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
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

const pageWrapperStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  minHeight: "calc(100vh - 70px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
};

const boxStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "400px",
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
  margin: "0 0 4px 0",
  textAlign: "center",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 24px 0",
  textAlign: "center",
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
};

export default SignIn;