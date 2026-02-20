"use client";

import TopBar from "./TopBar";
import ControlsBar from "./ControlsBar";
import MarketCard from "./MarketCard";

export default function PlayingScreen({
  round,
  timeLeft,
  balance,
  totalPnL,
  events,
  positions,
  tradeSize,
  showTrueProbs,
  onSetTradeSize,
  onToggleTrueProbs,
  onTrade,
  onResolve,
  onQuit,
}) {
  const positionCount = Object.keys(positions).length;
  const totalExposure = Object.values(positions).reduce((s, p) => s + p.qty, 0);

  return (
    <div style={styles.container}>
      <TopBar round={round} timeLeft={timeLeft} balance={balance} totalPnL={totalPnL} />
      <ControlsBar
        tradeSize={tradeSize}
        onSetTradeSize={onSetTradeSize}
        totalExposure={totalExposure}
        positionCount={positionCount}
        showTrueProbs={showTrueProbs}
        onToggleTrueProbs={onToggleTrueProbs}
        onResolve={onResolve}
        onQuit={onQuit}
      />
      <div style={styles.marketsArea}>
        {events.map((evt) => (
          <MarketCard
            key={evt.id}
            evt={evt}
            position={positions[evt.id]}
            showTrueProbs={showTrueProbs}
            onTrade={onTrade}
          />
        ))}
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
    overflow: "auto",
  },
  marketsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 12,
    padding: 16,
  },
};
