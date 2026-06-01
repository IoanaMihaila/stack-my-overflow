import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // <-- Folosește useAuth-ul nostru personalizat

function Navbar() {
  // MODIFICAT: Luăm și funcția logout din useAuth care șterge localStorage-ul backend-ului
  const { user, logout } = useAuth(); 

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Eroare la delogare:", err);
    }
  };

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <Link to="/" style={linkStyle}>
          <span style={{ color: "#0f172a", fontWeight: "800" }}>Stack </span>
          <span style={{ color: "#3b82f6", fontWeight: "800" }}> My Overflow</span>
        </Link>
      </div>
      <div style={linksContainerStyle}>
        <Link to="/" style={subLinkStyle}>Home</Link>
        
        {/* Link-ul devine needitabil/disabled dacă nu există utilizator în state-ul backend-ului */}
        <Link 
          to="/questions/new" 
          style={{
            ...subLinkStyle,
            opacity: user ? 1 : 0.5,
            pointerEvents: user ? "auto" : "none",
            cursor: user ? "pointer" : "not-allowed"
          }}
        >
          Ask Question
        </Link>

        {user ? (
          // Dacă utilizatorul este conectat în sistemul nou, îi afișăm USERNAME-ul din profiles
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
              {/* CORECTAT: Schimbat din user.email în user.username */}
              {user.username || user.email}
            </span>
            <button onClick={handleSignOut} style={signOutButtonStyle}>
              Sign Out
            </button>
          </div>
        ) : (
          // Dacă NU este conectat, afișăm butoanele de autentificare
          <>
            <Link to="/signin" style={subLinkStyle}>Sign In</Link>
            <Link to="/signup" style={buttonStyle}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 40px",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const logoStyle: React.CSSProperties = {
  fontSize: "18px",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
};

const linksContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  alignItems: "center",
};

const subLinkStyle: React.CSSProperties = {
  color: "#475569",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  transition: "color 0.15s ease",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "6px",
  backgroundColor: "#3b82f6",
  color: "white",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.2)",
};

const signOutButtonStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "6px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  boxShadow: "0 1px 2px rgba(239, 68, 68, 0.2)",
  transition: "background-color 0.15s ease",
};

export default Navbar;