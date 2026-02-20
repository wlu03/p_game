"use client";

import { formatMoney } from "@/lib/format";

export default function MenuScreen({ onStart, lastScore }) {
  return (
    <div style={styles.container}>
      <div style={styles.menuWrapper}>
        <div style={styles.menuGlow} />
        <div style={styles.logoBlock}>
          <div style={styles.logoIcon}>◈</div>
          <h1 style={styles.title}>PROB EXCHANGE</h1>
          <div style={styles.subtitle}>PROBABILITY MARKET MAKING SIMULATOR</div>
        </div>

        {lastScore && (
          <div style={styles.lastScoreBox}>
            <div style={styles.lastScoreTitle}>LAST GAME</div>
            <div style={styles.lastScoreRow}>
              <span style={styles.lastScoreLabel}>Balance</span>
              <span style={{
                ...styles.lastScoreValue,
                color: lastScore.balance >= 100000 ? "#00ff88" : "#ff4466",
              }}>
                {formatMoney(lastScore.balance)}
              </span>
            </div>
            <div style={styles.lastScoreRow}>
              <span style={styles.lastScoreLabel}>Rounds</span>
              <span style={styles.lastScoreValue}>{lastScore.roundsPlayed}</span>
            </div>
            <div style={styles.lastScoreRow}>
              <span style={styles.lastScoreLabel}>P&L</span>
              <span style={{
                ...styles.lastScoreValue,
                color: lastScore.totalPnL >= 0 ? "#00ff88" : "#ff4466",
              }}>
                {lastScore.totalPnL >= 0 ? "+" : ""}{formatMoney(lastScore.totalPnL)}
              </span>
            </div>
          </div>
        )}

        <div style={styles.rulesBox}>
          <div style={styles.rulesTitle}>HOW IT WORKS</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>01</span> You start with <span style={styles.highlight}>$100,000</span> in capital</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>02</span> Each round shows probability markets with <span style={styles.highlight}>BID / ASK</span> prices</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>03</span> Markets may be <span style={styles.highlight}>mispriced</span> — find the edge and trade</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>04</span> <span style={styles.highlight}>BUY</span> if you think true probability {">"} ask price</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>05</span> <span style={styles.highlight}>SELL</span> if you think true probability {"<"} bid price</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>06</span> Events resolve randomly — profit from correct pricing</div>
          <div style={styles.ruleItem}><span style={styles.ruleNum}>07</span> You have <span style={styles.highlight}>60 seconds</span> per round — game ends at $0</div>
        </div>
        <button style={styles.startBtn} onClick={onStart}>
          START TRADING ▸
        </button>
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
  menuWrapper: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "60px 24px",
    textAlign: "center",
    position: "relative",
  },
  menuGlow: {
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
  logoBlock: { marginBottom: 40 },
  logoIcon: { fontSize: 48, color: "#00ff88", marginBottom: 12 },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#e8ecf4",
    letterSpacing: 6,
    margin: 0,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 4,
    color: "#5a6070",
    marginTop: 8,
  },
  lastScoreBox: {
    background: "#0d1017",
    border: "1px solid #1a1e28",
    borderRadius: 8,
    padding: "14px 20px",
    marginBottom: 16,
    textAlign: "left",
  },
  lastScoreTitle: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#5a6070",
    marginBottom: 8,
  },
  lastScoreRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "3px 0",
  },
  lastScoreLabel: { fontSize: 11, color: "#5a6070", letterSpacing: 1 },
  lastScoreValue: { fontSize: 12, fontWeight: 700, color: "#e8ecf4" },
  rulesBox: {
    background: "#0d1017",
    border: "1px solid #1a1e28",
    borderRadius: 8,
    padding: "20px 24px",
    textAlign: "left",
    marginBottom: 32,
  },
  rulesTitle: {
    fontSize: 11,
    letterSpacing: 3,
    color: "#5a6070",
    marginBottom: 16,
  },
  ruleItem: { padding: "6px 0", lineHeight: 1.6, color: "#8890a0" },
  ruleNum: { color: "#00ff88", marginRight: 10, fontWeight: 700 },
  highlight: { color: "#e8ecf4", fontWeight: 600 },
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
