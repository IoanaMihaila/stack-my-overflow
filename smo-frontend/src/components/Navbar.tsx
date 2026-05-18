import { Link } from "react-router-dom";

function Navbar() {
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
        <Link to="/questions/new" style={subLinkStyle}>Ask Question</Link>
        <Link to="/signin" style={subLinkStyle}>Sign In</Link>
        <Link to="/signup" style={buttonStyle}>Sign Up</Link>
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
  backgroundColor: "#3b82f6", // Albastru modern
  color: "white",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  boxShadow: "0 1px 2px rgba(59, 130, 246, 0.2)",
};

export default Navbar;