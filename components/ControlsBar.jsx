"use client";

import { TRADE_SIZES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export default function ControlsBar({
  tradeSize,
  onSetTradeSize,
  totalExposure,
  positionCount,
  showTrueProbs,
  onToggleTrueProbs,
  onResolve,
  onQuit,
}) {
  return (
    <div style={styles.controlsBar}>
      <div style={styles.sizeControl}>
        <span style={styles.sizeLabel}>TRADE SIZE</span>
        {TRADE_SIZES.map((sz) => (
          <button
            key={sz}
            style={{ ...styles.sizeBtn, ...(tradeSize === sz ? styles.sizeBtnActive : {}) }}
            onClick={() => onSetTradeSize(sz)}
          >
            ${sz / 1000}K
          </button>
        ))}
      </div>
      <div style={styles.controlRight}>
        <span style={styles.exposureTag}>
          EXPOSURE: {formatMoney(totalExposure)} ({positionCount} pos)
        </span>
        <button style={styles.showProbBtn} onClick={onToggleTrueProbs}>
          {showTrueProbs ? "HIDE" : "SHOW"} TRUE PROB
        </button>
        <button style={styles.resolveBtn} onClick={onResolve}>RESOLVE NOW ▸</button>
        <button style={styles.quitBtn} onClick={onQuit}>QUIT</button>
      </div>
    </div>
  );
}

const styles = {
  controlsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    background: "#0b0e14",
    borderBottom: "1px solid #151920",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeControl: { display: "flex", alignItems: "center", gap: 6 },
  sizeLabel: { fontSize: 10, letterSpacing: 2, color: "#5a6070", marginRight: 4 },
  sizeBtn: {
    background: "#1a1e28",
    border: "1px solid #252a36",
    color: "#8890a0",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontFamily: "inherit",
  },
  sizeBtnActive: {
    background: "#00ff8822",
    borderColor: "#00ff8866",
    color: "#00ff88",
  },
  controlRight: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  exposureTag: { fontSize: 10, color: "#5a6070", letterSpacing: 1 },
  showProbBtn: {
    background: "#1a1e28",
    border: "1px solid #252a36",
    color: "#ffaa44",
    padding: "4px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "inherit",
    letterSpacing: 1,
  },
  resolveBtn: {
    background: "#00ff8822",
    border: "1px solid #00ff8844",
    color: "#00ff88",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "inherit",
    fontWeight: 700,
    letterSpacing: 1,
  },
  quitBtn: {
    background: "#ff446622",
    border: "1px solid #ff446644",
    color: "#ff4466",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 10,
    fontFamily: "inherit",
    letterSpacing: 1,
  },
};
