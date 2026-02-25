"use client";

import { formatMoney } from "@/lib/format";

export default function TopBar({ round, timeLeft, balance, totalPnL }) {
  return (
    <div style={styles.topBar}>
      <div style={styles.topLeft}>
        <div style={styles.topLogo}>◈ MARKET MAKING SIMULATOR</div>
        <div style={styles.roundBadge}>ROUND {round}</div>
      </div>
      <div style={styles.topCenter}>
        <div style={{
          ...styles.timer,
          color: timeLeft <= 10 ? "#ff4466" : timeLeft <= 20 ? "#ffaa44" : "#00ff88",
        }}>
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>
      <div style={styles.topRight}>
        <div style={styles.balBlock}>
          <div style={styles.balLabel}>BALANCE</div>
          <div style={styles.balValue}>{formatMoney(balance)}</div>
        </div>
        <div style={styles.balBlock}>
          <div style={styles.balLabel}>TOTAL P&L</div>
          <div style={{
            ...styles.balValue,
            color: totalPnL >= 0 ? "#00ff88" : "#ff4466",
            fontSize: 14,
          }}>
            {totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "#0d1017",
    borderBottom: "1px solid #1a1e28",
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexWrap: "wrap",
    gap: 8,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 12 },
  topLogo: { color: "#00ff88", fontWeight: 700, fontSize: 13, letterSpacing: 2 },
  roundBadge: {
    background: "#1a1e28",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 11,
    letterSpacing: 2,
    color: "#8890a0",
  },
  topCenter: { display: "flex", alignItems: "center" },
  timer: { fontSize: 28, fontWeight: 700, letterSpacing: 4 },
  topRight: { display: "flex", alignItems: "center", gap: 16 },
  balBlock: { textAlign: "right" },
  balLabel: { fontSize: 9, letterSpacing: 2, color: "#5a6070" },
  balValue: { fontSize: 16, fontWeight: 700, color: "#e8ecf4" },
};
