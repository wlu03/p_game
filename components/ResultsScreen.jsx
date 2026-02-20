"use client";

import { catColors } from "@/lib/constants";
import { formatMoney, formatPct } from "@/lib/format";

export default function ResultsScreen({
  round,
  resolutions,
  balance,
  totalPnL,
  peakBalance,
  onNextRound,
  onEndGame,
}) {
  const { events: rEvents, trades, roundPnL } = resolutions;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.roundLabel}>ROUND {round} SETTLEMENT</div>
          <div style={{ ...styles.bigPnL, color: roundPnL >= 0 ? "#00ff88" : "#ff4466" }}>
            {roundPnL >= 0 ? "+" : ""}{formatMoney(roundPnL)}
          </div>
        </div>

        <div style={styles.grid}>
          {rEvents.map((evt) => {
            const trade = trades.find((t) => t.event === evt.name);
            const c = catColors[evt.category];
            return (
              <div key={evt.id} style={{ ...styles.card, borderColor: c.border, background: c.bg }}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.catBadge, background: c.badge, color: c.text }}>
                    {evt.category}
                  </span>
                  <span style={{
                    ...styles.outcomeTag,
                    background: evt.happened ? "#0a2e1a" : "#2e0a0a",
                    color: evt.happened ? "#00ff88" : "#ff4466",
                  }}>
                    {evt.happened ? "✓ YES" : "✗ NO"}
                  </span>
                </div>
                <div style={styles.eventName}>{evt.name}</div>
                <div style={styles.probRow}>
                  <span style={styles.label}>True Prob:</span>
                  <span style={styles.value}>{formatPct(evt.trueProb)}</span>
                  <span style={styles.label}>Market:</span>
                  <span style={styles.value}>{formatPct(evt.bid)} / {formatPct(evt.ask)}</span>
                </div>
                {trade ? (
                  <div style={{ ...styles.tradeLine, color: trade.pnl >= 0 ? "#00ff88" : "#ff4466" }}>
                    {trade.side.toUpperCase()} ${trade.qty.toLocaleString()} @ {formatPct(trade.price)} →{" "}
                    {trade.pnl >= 0 ? "+" : ""}{formatMoney(trade.pnl)}
                  </div>
                ) : (
                  <div style={styles.noTrade}>NO POSITION</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>BALANCE</div>
            <div style={styles.summaryVal}>{formatMoney(balance)}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>TOTAL P&L</div>
            <div style={{ ...styles.summaryVal, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
              {totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>PEAK</div>
            <div style={styles.summaryVal}>{formatMoney(peakBalance)}</div>
          </div>
        </div>

        <div style={styles.btns}>
          <button style={styles.nextBtn} onClick={onNextRound}>NEXT ROUND ▸</button>
          <button style={styles.endBtn} onClick={onEndGame}>CASH OUT</button>
        </div>
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
  wrapper: { maxWidth: 800, margin: "0 auto", padding: "24px 16px" },
  header: { textAlign: "center", marginBottom: 24 },
  roundLabel: { fontSize: 11, letterSpacing: 3, color: "#5a6070", marginBottom: 4 },
  bigPnL: { fontSize: 40, fontWeight: 700, letterSpacing: 2 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 10,
    marginBottom: 24,
  },
  card: { border: "1px solid", borderRadius: 8, padding: 14 },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  catBadge: {
    padding: "2px 8px",
    borderRadius: 3,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: 700,
  },
  outcomeTag: {
    padding: "2px 8px",
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
  },
  eventName: { fontSize: 12, fontWeight: 600, color: "#e8ecf4", marginBottom: 6 },
  probRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  label: { fontSize: 9, color: "#5a6070", letterSpacing: 1 },
  value: { fontSize: 11, fontWeight: 600, color: "#c8ccd4" },
  tradeLine: { fontSize: 11, fontWeight: 700, letterSpacing: 0.5 },
  noTrade: { fontSize: 10, color: "#3a3e48", fontStyle: "italic" },
  summaryBar: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    padding: "16px 0",
    borderTop: "1px solid #1a1e28",
    borderBottom: "1px solid #1a1e28",
    marginBottom: 24,
  },
  summaryItem: { textAlign: "center" },
  summaryLabel: { fontSize: 9, letterSpacing: 2, color: "#5a6070", marginBottom: 2 },
  summaryVal: { fontSize: 18, fontWeight: 700, color: "#e8ecf4" },
  btns: { display: "flex", justifyContent: "center", gap: 12 },
  nextBtn: {
    background: "linear-gradient(135deg, #00cc6a, #00ff88)",
    color: "#0a0c10",
    border: "none",
    padding: "12px 36px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  endBtn: {
    background: "#1a1e28",
    color: "#8890a0",
    border: "1px solid #252a36",
    padding: "12px 36px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
