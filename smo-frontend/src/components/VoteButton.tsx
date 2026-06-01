import React, { useState, useEffect } from "react";

interface VoteButtonProps {
  count: number;
  onVote: (value: 1 | -1) => Promise<void>;
}

export function VoteButton({ count, onVote }: VoteButtonProps) {
  const [displayedCount, setDisplayedCount] = useState(count);
  const [isVoting, setIsVoting] = useState(false);

  // Sincronizăm scorul local dacă se modifică starea în componenta părinte
  useEffect(() => {
    setDisplayedCount(count);
  }, [count]);

  const handleVoteClick = async (value: 1 | -1) => {
    if (isVoting) return;

    // Pasul 1: Backup pe starea curentă și randare optimistă instantanee pe ecran
    const previousCount = displayedCount;
    setDisplayedCount(previousCount + value);
    setIsVoting(true);

    try {
      // Pasul 2: Lansăm callback-ul de API din pagină
      await onVote(value);
    } catch (err) {
      console.error("Voting request failed, reverting UI:", err);
      // Pasul 3: Revert/Rollback în caz de eșec (token invalid, eroare server etc.)
      setDisplayedCount(previousCount);
      alert("Could not register your vote. Make sure you are signed in.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div style={voteColStyle}>
      <button onClick={() => handleVoteClick(1)} disabled={isVoting} style={voteTriangleStyle}>▲</button>
      <span style={voteCountStyle}>{displayedCount}</span>
      <button onClick={() => handleVoteClick(-1)} disabled={isVoting} style={voteTriangleStyle}>▼</button>
    </div>
  );
}

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
  color: "#64748b",
  fontSize: "22px",
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

const voteCountStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#334155",
};