"use client";

import { formatMoney } from "@/lib/format";

export default function GameOverScreen({ balance, totalPnL, round, peakBalance, roundHistory, onPlayAgain }) {
  const returnPct = ((balance - 100000) / 100000 * 100).toFixed(1);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.glow} />
        <div style={styles.logoIcon}>{balance <= 0 ? "✗" : "◈"}</div>
        <h1 style={styles.title}>{balance <= 0 ? "LIQUIDATED" : "CASHED OUT"}</h1>
        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>FINAL BALANCE</span>
            <span style={{ ...styles.statValue, color: balance >= 100000 ? "#00ff88" : "#ff4466" }}>
              {formatMoney(balance)}
            </span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>RETURN</span>
            <span style={{ ...styles.statValue, color: parseFloat(returnPct) >= 0 ? "#00ff88" : "#ff4466" }}>
              {returnPct}%
            </span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>ROUNDS PLAYED</span>
            <span style={styles.statValue}>{round}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>PEAK BALANCE</span>
            <span style={styles.statValue}>{formatMoney(peakBalance)}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>TOTAL P&L</span>
            <span style={{ ...styles.statValue, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
              {totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}
            </span>
          </div>
        </div>
        {roundHistory.length > 0 && (
          <div style={styles.historyBox}>
            <div style={styles.histTitle}>ROUND HISTORY</div>
            {roundHistory.map((rh, i) => (
              <div key={i} style={styles.histRow}>
                <span style={styles.histRound}>R{rh.round}</span>
                <span style={{ color: rh.pnl >= 0 ? "#00ff88" : "#ff4466" }}>
                  {rh.pnl >= 0 ? "+" : ""}{formatMoney(rh.pnl)}
                </span>
                <span style={styles.histBal}>{formatMoney(rh.balance)}</span>
              </div>
            ))}
          </div>
        )}
        <button style={styles.startBtn} onClick={onPlayAgain}>PLAY AGAIN ▸</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0c10",
    color: "#c8ccd4",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
    fontSize: 13,
  },
  wrapper: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "60px 24px",
    textAlign: "center",
    position: "relative",
  },
  glow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    height: 400,
    background: "radial-gradient(circle, #00ff8808 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  logoIcon: { fontSize: 48, color: "#00ff88", marginBottom: 12 },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#e8ecf4",
    letterSpacing: 6,
    margin: "0 0 24px 0",
  },
  stats: {
    background: "#0d1017",
    border: "1px solid #1a1e28",
    borderRadius: 8,
    padding: "20px 24px",
    marginBottom: 24,
    textAlign: "left",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #12161e",
  },
  statLabel: { fontSize: 11, letterSpacing: 2, color: "#5a6070" },
  statValue: { fontSize: 14, fontWeight: 700, color: "#e8ecf4" },
  historyBox: {
    background: "#0d1017",
    border: "1px solid #1a1e28",
    borderRadius: 8,
    padding: "16px 20px",
    marginBottom: 24,
    maxHeight: 200,
    overflow: "auto",
  },
  histTitle: { fontSize: 10, letterSpacing: 2, color: "#5a6070", marginBottom: 10 },
  histRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 0",
    fontSize: 12,
  },
  histRound: { color: "#5a6070", width: 40 },
  histBal: { color: "#8890a0" },
  startBtn: {
    background: "linear-gradient(135deg, #00cc6a, #00ff88)",
    color: "#0a0c10",
    border: "none",
    padding: "14px 48px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 3,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
