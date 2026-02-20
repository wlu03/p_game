"use client";

import { catColors } from "@/lib/constants";
import { formatPct } from "@/lib/format";

export default function MarketCard({ evt, position, showTrueProbs, onTrade }) {
  const c = catColors[evt.category];
  const edge = evt.trueProb != null ? evt.trueProb - evt.mid : 0;

  return (
    <div style={{ ...styles.card, borderColor: c.border, background: c.bg }}>
      <div style={styles.header}>
        <span style={{ ...styles.catBadge, background: c.badge, color: c.text }}>{evt.category}</span>
        {showTrueProbs && evt.trueProb != null && (
          <span style={styles.trueProbTag}>TRUE: {formatPct(evt.trueProb)}</span>
        )}
      </div>
      <div style={styles.eventName}>{evt.name}</div>

      <div style={styles.priceRow}>
        <div style={styles.priceBlock}>
          <div style={styles.priceLabel}>BID</div>
          <div style={styles.bidPrice}>{formatPct(evt.bid)}</div>
        </div>
        <div style={styles.spread}>{((evt.ask - evt.bid) * 100).toFixed(1)}¢ spread</div>
        <div style={styles.priceBlock}>
          <div style={styles.priceLabel}>ASK</div>
          <div style={styles.askPrice}>{formatPct(evt.ask)}</div>
        </div>
      </div>

      {showTrueProbs && evt.trueProb != null && (
        <div style={styles.edgeBar}>
          <div style={{
            ...styles.edgeIndicator,
            background: Math.abs(edge) > 0.05
              ? (edge > 0 ? "#00ff8833" : "#ff446633")
              : "#ffffff11",
          }}>
            Edge: {edge > 0 ? "+" : ""}{(edge * 100).toFixed(1)}¢{" "}
            {Math.abs(edge) > 0.05 ? (edge > 0 ? "→ BUY" : "→ SELL") : "— PASS"}
          </div>
        </div>
      )}

      <div style={styles.tradeRow}>
        <button
          style={{ ...styles.sellBtn, ...(position?.side === "sell" ? styles.sellBtnActive : {}) }}
          onClick={() => onTrade(evt.id, "sell")}
        >
          SELL
        </button>
        <button
          style={{ ...styles.buyBtn, ...(position?.side === "buy" ? styles.buyBtnActive : {}) }}
          onClick={() => onTrade(evt.id, "buy")}
        >
          BUY
        </button>
      </div>

      {position && (
        <div style={styles.posTag}>
          {position.side.toUpperCase()} ${position.qty.toLocaleString()} @ {formatPct(position.price)}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid",
    borderRadius: 8,
    padding: 16,
    transition: "all 0.15s",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBadge: {
    padding: "2px 8px",
    borderRadius: 3,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: 700,
  },
  trueProbTag: { fontSize: 10, color: "#ffaa44", fontWeight: 600 },
  eventName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e8ecf4",
    marginBottom: 12,
    lineHeight: 1.4,
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priceBlock: { textAlign: "center" },
  priceLabel: { fontSize: 9, letterSpacing: 2, color: "#5a6070", marginBottom: 2 },
  bidPrice: { fontSize: 20, fontWeight: 700, color: "#ff4466" },
  askPrice: { fontSize: 20, fontWeight: 700, color: "#00ff88" },
  spread: { fontSize: 10, color: "#5a6070" },
  edgeBar: { marginBottom: 10 },
  edgeIndicator: {
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 10,
    textAlign: "center",
    fontWeight: 600,
    color: "#c8ccd4",
  },
  tradeRow: { display: "flex", gap: 8 },
  sellBtn: {
    flex: 1,
    padding: "8px 0",
    background: "#ff446615",
    border: "1px solid #ff446633",
    color: "#ff4466",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "inherit",
  },
  sellBtnActive: {
    background: "#ff446644",
    borderColor: "#ff4466",
    boxShadow: "0 0 12px #ff446633",
  },
  buyBtn: {
    flex: 1,
    padding: "8px 0",
    background: "#00ff8815",
    border: "1px solid #00ff8833",
    color: "#00ff88",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: "inherit",
  },
  buyBtnActive: {
    background: "#00ff8844",
    borderColor: "#00ff88",
    boxShadow: "0 0 12px #00ff8833",
  },
  posTag: {
    marginTop: 8,
    padding: "4px 8px",
    background: "#ffffff08",
    borderRadius: 4,
    fontSize: 10,
    color: "#c8ccd4",
    textAlign: "center",
    fontWeight: 600,
  },
};
