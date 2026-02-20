import { useState, useEffect, useCallback, useRef } from "react";

const ROUND_TIME = 60;

const generateEvents = () => {
  const allEvents = [
    // Coin events
    { name: "3 Heads in a Row (3 flips)", trueProb: 0.125, category: "COIN" },
    { name: "At Least 2 Tails in 5 Flips", trueProb: 1 - (Math.pow(0.5,5) + 5*Math.pow(0.5,5)), category: "COIN" },
    { name: "Exactly 1 Head in 4 Flips", trueProb: 4 * 0.5 * Math.pow(0.5, 3), category: "COIN" },
    { name: "All Same Side in 4 Flips", trueProb: 2 * Math.pow(0.5, 4), category: "COIN" },
    { name: "More Heads Than Tails (5 Flips)", trueProb: 0.5, category: "COIN" },
    { name: "No Heads in 3 Flips", trueProb: 0.125, category: "COIN" },
    { name: "Alternating H/T in 4 Flips", trueProb: 2 * Math.pow(0.5, 4), category: "COIN" },
    // Dice events
    { name: "Roll a 6 (Single Die)", trueProb: 1/6, category: "DICE" },
    { name: "Sum of 2 Dice > 8", trueProb: 10/36, category: "DICE" },
    { name: "Rolling Doubles (2 Dice)", trueProb: 6/36, category: "DICE" },
    { name: "At Least One 1 in 3 Rolls", trueProb: 1 - Math.pow(5/6, 3), category: "DICE" },
    { name: "Sum of 2 Dice = 7", trueProb: 6/36, category: "DICE" },
    { name: "All Dice > 3 (2 Dice)", trueProb: Math.pow(3/6, 2), category: "DICE" },
    { name: "Sum of 3 Dice ≥ 15", trueProb: 20/216, category: "DICE" },
    { name: "No 6s in 4 Rolls", trueProb: Math.pow(5/6, 4), category: "DICE" },
    { name: "Exactly Two 6s in 5 Rolls", trueProb: 10 * Math.pow(1/6,2) * Math.pow(5/6,3), category: "DICE" },
    // Card events
    { name: "Draw an Ace (from 52)", trueProb: 4/52, category: "CARD" },
    { name: "Draw a Red Card", trueProb: 26/52, category: "CARD" },
    { name: "Draw a Face Card (J/Q/K)", trueProb: 12/52, category: "CARD" },
    { name: "Draw a Spade", trueProb: 13/52, category: "CARD" },
    { name: "Draw a Card > 8 (incl. face)", trueProb: 24/52, category: "CARD" },
    { name: "Draw 2 Cards, Both Red", trueProb: (26/52)*(25/51), category: "CARD" },
    { name: "Draw 2 Cards, Same Suit", trueProb: 4*(13/52)*(12/51), category: "CARD" },
    { name: "Draw a Prime Number Card (2,3,5,7)", trueProb: 16/52, category: "CARD" },
    { name: "Draw King or Queen", trueProb: 8/52, category: "CARD" },
    // Mixed / advanced
    { name: "Heads AND Die > 4", trueProb: 0.5 * (2/6), category: "MIXED" },
    { name: "Tails OR Die = 1", trueProb: 0.5 + 1/6 - (0.5 * 1/6), category: "MIXED" },
    { name: "Red Card AND Heads", trueProb: 0.5 * 0.5, category: "MIXED" },
    { name: "Die ≤ 2 AND Card is Ace", trueProb: (2/6) * (4/52), category: "MIXED" },
    { name: "At Least 1 of: Heads, Die=6, Ace", trueProb: 1 - 0.5*(5/6)*(48/52), category: "MIXED" },
    { name: "Heads AND Die > 2 AND Red Card", trueProb: 0.5 * (4/6) * 0.5, category: "MIXED" },
  ];

  // Pick 5-7 random events
  const count = 5 + Math.floor(Math.random() * 3);
  const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((evt, i) => {
    // Generate bid/ask with spread and potential mispricing
    const mispricing = (Math.random() - 0.5) * 0.20; // up to ±10% mispricing
    const spread = 0.02 + Math.random() * 0.06; // 2-8% spread
    const mid = Math.max(0.03, Math.min(0.97, evt.trueProb + mispricing));
    const bid = Math.max(0.01, mid - spread / 2);
    const ask = Math.min(0.99, mid + spread / 2);
    return {
      ...evt,
      id: i,
      bid: parseFloat(bid.toFixed(3)),
      ask: parseFloat(ask.toFixed(3)),
      mid: parseFloat(mid.toFixed(3)),
    };
  });
};

const catColors = {
  COIN: { bg: "#1a2f1a", border: "#2d5a2d", text: "#6fcf6f", badge: "#0d1f0d" },
  DICE: { bg: "#2f1a1a", border: "#5a2d2d", text: "#cf6f6f", badge: "#1f0d0d" },
  CARD: { bg: "#1a1a2f", border: "#2d2d5a", text: "#6f6fcf", badge: "#0d0d1f" },
  MIXED: { bg: "#2f2a1a", border: "#5a4d2d", text: "#cfbf6f", badge: "#1f1a0d" },
};

export default function ProbabilityMarketGame() {
  const [screen, setScreen] = useState("menu"); // menu, playing, results, gameover
  const [balance, setBalance] = useState(100000);
  const [round, setRound] = useState(1);
  const [events, setEvents] = useState([]);
  const [positions, setPositions] = useState({}); // eventId -> { side: 'buy'|'sell', qty, price }
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundHistory, setRoundHistory] = useState([]);
  const [resolutions, setResolutions] = useState(null);
  const [totalPnL, setTotalPnL] = useState(0);
  const [tradeSize, setTradeSize] = useState(1000);
  const timerRef = useRef(null);
  const [peakBalance, setPeakBalance] = useState(100000);
  const [showTrueProbs, setShowTrueProbs] = useState(false);

  const startGame = () => {
    setBalance(100000);
    setRound(1);
    setPositions({});
    setRoundHistory([]);
    setTotalPnL(0);
    setPeakBalance(100000);
    setShowTrueProbs(false);
    const newEvents = generateEvents();
    setEvents(newEvents);
    setTimeLeft(ROUND_TIME);
    setScreen("playing");
  };

  useEffect(() => {
    if (screen === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (screen === "playing" && timeLeft === 0) {
      resolveRound();
    }
  }, [screen, timeLeft]);

  const placeTrade = (eventId, side) => {
    const evt = events.find(e => e.id === eventId);
    const price = side === "buy" ? evt.ask : evt.bid;
    const cost = tradeSize;
    if (cost > balance) return;

    setPositions(prev => {
      const existing = prev[eventId];
      if (existing && existing.side !== side) {
        // Close position
        const { [eventId]: _, ...rest } = prev;
        return rest;
      }
      if (existing && existing.side === side) {
        return {
          ...prev,
          [eventId]: {
            ...existing,
            qty: existing.qty + cost,
            price: (existing.price * existing.qty + price * cost) / (existing.qty + cost),
          },
        };
      }
      return { ...prev, [eventId]: { side, qty: cost, price } };
    });
    setBalance(b => b - cost);
  };

  const resolveRound = () => {
    clearTimeout(timerRef.current);
    // Resolve each event
    const resolved = events.map(evt => {
      const happened = Math.random() < evt.trueProb;
      return { ...evt, happened };
    });

    // Calculate P&L
    let roundPnL = 0;
    const tradeResults = [];
    Object.entries(positions).forEach(([eid, pos]) => {
      const evt = resolved.find(e => e.id === parseInt(eid));
      if (!evt) return;
      let pnl = 0;
      if (pos.side === "buy") {
        // Bought at ask price, pays trueValue (1 if happened, 0 if not)
        const payout = evt.happened ? 1 : 0;
        pnl = pos.qty * (payout - pos.price) / pos.price;
      } else {
        // Sold at bid price, receives bid, pays out 1 if happened
        const payout = evt.happened ? 1 : 0;
        pnl = pos.qty * (pos.price - payout) / pos.price;
      }
      roundPnL += pnl;
      tradeResults.push({ event: evt.name, side: pos.side, qty: pos.qty, price: pos.price, happened: evt.happened, pnl });
    });

    // Return all position costs
    let returnedCapital = 0;
    Object.values(positions).forEach(pos => {
      returnedCapital += pos.qty;
    });

    const newBalance = balance + returnedCapital + roundPnL;
    const newTotal = totalPnL + roundPnL;

    setResolutions({ events: resolved, trades: tradeResults, roundPnL, returnedCapital });
    setRoundHistory(prev => [...prev, { round, pnl: roundPnL, balance: newBalance }]);
    setBalance(newBalance);
    setTotalPnL(newTotal);
    setPeakBalance(p => Math.max(p, newBalance));
    setPositions({});

    if (newBalance <= 0) {
      setScreen("gameover");
    } else {
      setScreen("results");
    }
  };

  const nextRound = () => {
    setRound(r => r + 1);
    setEvents(generateEvents());
    setTimeLeft(ROUND_TIME);
    setResolutions(null);
    setShowTrueProbs(false);
    setScreen("playing");
  };

  const endGame = () => {
    setScreen("gameover");
  };

  const positionCount = Object.keys(positions).length;
  const totalExposure = Object.values(positions).reduce((s, p) => s + p.qty, 0);

  const formatMoney = (n) => {
    const sign = n >= 0 ? "" : "-";
    return sign + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatPct = (n) => (n * 100).toFixed(1) + "¢";

  // ---- MENU ----
  if (screen === "menu") {
    return (
      <div style={styles.container}>
        <div style={styles.menuWrapper}>
          <div style={styles.menuGlow} />
          <div style={styles.logoBlock}>
            <div style={styles.logoIcon}>◈</div>
            <h1 style={styles.title}>PROB EXCHANGE</h1>
            <div style={styles.subtitle}>PROBABILITY MARKET MAKING SIMULATOR</div>
          </div>
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
          <button style={styles.startBtn} onClick={startGame}>
            START TRADING ▸
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULTS ----
  if (screen === "results" && resolutions) {
    const { events: rEvents, trades, roundPnL } = resolutions;
    return (
      <div style={styles.container}>
        <div style={styles.resultsWrapper}>
          <div style={styles.resultsHeader}>
            <div style={styles.roundLabel}>ROUND {round} SETTLEMENT</div>
            <div style={{ ...styles.bigPnL, color: roundPnL >= 0 ? "#00ff88" : "#ff4466" }}>
              {roundPnL >= 0 ? "+" : ""}{formatMoney(roundPnL)}
            </div>
          </div>

          <div style={styles.resolutionGrid}>
            {rEvents.map(evt => {
              const trade = trades.find(t => t.event === evt.name);
              const c = catColors[evt.category];
              return (
                <div key={evt.id} style={{ ...styles.resCard, borderColor: c.border, background: c.bg }}>
                  <div style={styles.resCardTop}>
                    <span style={{ ...styles.catBadge, background: c.badge, color: c.text }}>{evt.category}</span>
                    <span style={{ ...styles.outcomeTag, background: evt.happened ? "#0a2e1a" : "#2e0a0a", color: evt.happened ? "#00ff88" : "#ff4466" }}>
                      {evt.happened ? "✓ YES" : "✗ NO"}
                    </span>
                  </div>
                  <div style={styles.resEventName}>{evt.name}</div>
                  <div style={styles.resProbRow}>
                    <span style={styles.resLabel}>True Prob:</span>
                    <span style={styles.resValue}>{formatPct(evt.trueProb)}</span>
                    <span style={styles.resLabel}>Market:</span>
                    <span style={styles.resValue}>{formatPct(evt.bid)} / {formatPct(evt.ask)}</span>
                  </div>
                  {trade ? (
                    <div style={{ ...styles.tradeLine, color: trade.pnl >= 0 ? "#00ff88" : "#ff4466" }}>
                      {trade.side.toUpperCase()} ${trade.qty.toLocaleString()} @ {formatPct(trade.price)} → {trade.pnl >= 0 ? "+" : ""}{formatMoney(trade.pnl)}
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
              <div style={{ ...styles.summaryVal, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>{totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>PEAK</div>
              <div style={styles.summaryVal}>{formatMoney(peakBalance)}</div>
            </div>
          </div>

          <div style={styles.resultsBtns}>
            <button style={styles.nextBtn} onClick={nextRound}>NEXT ROUND ▸</button>
            <button style={styles.endBtn} onClick={endGame}>CASH OUT</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- GAME OVER ----
  if (screen === "gameover") {
    const returnPct = ((balance - 100000) / 100000 * 100).toFixed(1);
    return (
      <div style={styles.container}>
        <div style={styles.menuWrapper}>
          <div style={styles.menuGlow} />
          <div style={styles.logoIcon}>{balance <= 0 ? "✗" : "◈"}</div>
          <h1 style={styles.title}>{balance <= 0 ? "LIQUIDATED" : "CASHED OUT"}</h1>
          <div style={styles.gameOverStats}>
            <div style={styles.goStatRow}>
              <span style={styles.goLabel}>FINAL BALANCE</span>
              <span style={{ ...styles.goValue, color: balance >= 100000 ? "#00ff88" : "#ff4466" }}>{formatMoney(balance)}</span>
            </div>
            <div style={styles.goStatRow}>
              <span style={styles.goLabel}>RETURN</span>
              <span style={{ ...styles.goValue, color: parseFloat(returnPct) >= 0 ? "#00ff88" : "#ff4466" }}>{returnPct}%</span>
            </div>
            <div style={styles.goStatRow}>
              <span style={styles.goLabel}>ROUNDS PLAYED</span>
              <span style={styles.goValue}>{round}</span>
            </div>
            <div style={styles.goStatRow}>
              <span style={styles.goLabel}>PEAK BALANCE</span>
              <span style={styles.goValue}>{formatMoney(peakBalance)}</span>
            </div>
            <div style={styles.goStatRow}>
              <span style={styles.goLabel}>TOTAL P&L</span>
              <span style={{ ...styles.goValue, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>{totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}</span>
            </div>
          </div>
          {roundHistory.length > 0 && (
            <div style={styles.historyBox}>
              <div style={styles.histTitle}>ROUND HISTORY</div>
              {roundHistory.map((rh, i) => (
                <div key={i} style={styles.histRow}>
                  <span style={styles.histRound}>R{rh.round}</span>
                  <span style={{ color: rh.pnl >= 0 ? "#00ff88" : "#ff4466" }}>{rh.pnl >= 0 ? "+" : ""}{formatMoney(rh.pnl)}</span>
                  <span style={styles.histBal}>{formatMoney(rh.balance)}</span>
                </div>
              ))}
            </div>
          )}
          <button style={styles.startBtn} onClick={startGame}>PLAY AGAIN ▸</button>
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  return (
    <div style={styles.container}>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.topLogo}>◈ PROB EXCHANGE</div>
          <div style={styles.roundBadge}>ROUND {round}</div>
        </div>
        <div style={styles.topCenter}>
          <div style={{ ...styles.timer, color: timeLeft <= 10 ? "#ff4466" : timeLeft <= 20 ? "#ffaa44" : "#00ff88" }}>
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>
        <div style={styles.topRight}>
          <div style={styles.balBlock}>
            <div style={styles.balLabel}>BALANCE</div>
            <div style={styles.balValue}>{formatMoney(balance)}</div>
          </div>
          <div style={styles.balBlock}>
            <div style={styles.balLabel}>TOTAL P&L</div>
            <div style={{ ...styles.balValue, color: totalPnL >= 0 ? "#00ff88" : "#ff4466", fontSize: 14 }}>
              {totalPnL >= 0 ? "+" : ""}{formatMoney(totalPnL)}
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div style={styles.controlsBar}>
        <div style={styles.sizeControl}>
          <span style={styles.sizeLabel}>TRADE SIZE</span>
          {[1000, 5000, 10000, 25000].map(sz => (
            <button
              key={sz}
              style={{ ...styles.sizeBtn, ...(tradeSize === sz ? styles.sizeBtnActive : {}) }}
              onClick={() => setTradeSize(sz)}
            >
              ${(sz/1000)}K
            </button>
          ))}
        </div>
        <div style={styles.controlRight}>
          <span style={styles.exposureTag}>EXPOSURE: {formatMoney(totalExposure)} ({positionCount} pos)</span>
          <button style={styles.showProbBtn} onClick={() => setShowTrueProbs(p => !p)}>
            {showTrueProbs ? "HIDE" : "SHOW"} TRUE PROB
          </button>
          <button style={styles.resolveBtn} onClick={resolveRound}>RESOLVE NOW ▸</button>
          <button style={styles.quitBtn} onClick={endGame}>QUIT</button>
        </div>
      </div>

      {/* MARKETS */}
      <div style={styles.marketsArea}>
        {events.map(evt => {
          const c = catColors[evt.category];
          const pos = positions[evt.id];
          const edge = evt.trueProb - evt.mid;
          return (
            <div key={evt.id} style={{ ...styles.marketCard, borderColor: c.border, background: c.bg }}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.catBadge, background: c.badge, color: c.text }}>{evt.category}</span>
                {showTrueProbs && (
                  <span style={styles.trueProbTag}>TRUE: {formatPct(evt.trueProb)}</span>
                )}
              </div>
              <div style={styles.eventName}>{evt.name}</div>

              <div style={styles.priceRow}>
                <div style={styles.priceBlock}>
                  <div style={styles.priceLabel}>BID</div>
                  <div style={styles.bidPrice}>{formatPct(evt.bid)}</div>
                </div>
                <div style={styles.spread}>{((evt.ask - evt.bid)*100).toFixed(1)}¢ spread</div>
                <div style={styles.priceBlock}>
                  <div style={styles.priceLabel}>ASK</div>
                  <div style={styles.askPrice}>{formatPct(evt.ask)}</div>
                </div>
              </div>

              {showTrueProbs && (
                <div style={styles.edgeBar}>
                  <div style={{ ...styles.edgeIndicator, background: Math.abs(edge) > 0.05 ? (edge > 0 ? "#00ff8833" : "#ff446633") : "#ffffff11" }}>
                    Edge: {edge > 0 ? "+" : ""}{(edge * 100).toFixed(1)}¢ {Math.abs(edge) > 0.05 ? (edge > 0 ? "→ BUY" : "→ SELL") : "— PASS"}
                  </div>
                </div>
              )}

              <div style={styles.tradeRow}>
                <button
                  style={{ ...styles.sellBtn, ...(pos?.side === "sell" ? styles.sellBtnActive : {}) }}
                  onClick={() => placeTrade(evt.id, "sell")}
                >
                  SELL
                </button>
                <button
                  style={{ ...styles.buyBtn, ...(pos?.side === "buy" ? styles.buyBtnActive : {}) }}
                  onClick={() => placeTrade(evt.id, "buy")}
                >
                  BUY
                </button>
              </div>

              {pos && (
                <div style={styles.posTag}>
                  {pos.side.toUpperCase()} ${pos.qty.toLocaleString()} @ {formatPct(pos.price)}
                </div>
              )}
            </div>
          );
        })}
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
  // MENU
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
  ruleItem: {
    padding: "6px 0",
    lineHeight: 1.6,
    color: "#8890a0",
  },
  ruleNum: {
    color: "#00ff88",
    marginRight: 10,
    fontWeight: 700,
  },
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
  // TOP BAR
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
  timer: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 4,
  },
  topRight: { display: "flex", alignItems: "center", gap: 16 },
  balBlock: { textAlign: "right" },
  balLabel: { fontSize: 9, letterSpacing: 2, color: "#5a6070" },
  balValue: { fontSize: 16, fontWeight: 700, color: "#e8ecf4" },
  // CONTROLS
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
  // MARKETS
  marketsArea: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 12,
    padding: 16,
  },
  marketCard: {
    border: "1px solid",
    borderRadius: 8,
    padding: 16,
    transition: "all 0.15s",
  },
  cardHeader: {
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
  trueProbTag: {
    fontSize: 10,
    color: "#ffaa44",
    fontWeight: 600,
  },
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
  tradeRow: {
    display: "flex",
    gap: 8,
  },
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
  // RESULTS
  resultsWrapper: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "24px 16px",
  },
  resultsHeader: { textAlign: "center", marginBottom: 24 },
  roundLabel: { fontSize: 11, letterSpacing: 3, color: "#5a6070", marginBottom: 4 },
  bigPnL: { fontSize: 40, fontWeight: 700, letterSpacing: 2 },
  resolutionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 10,
    marginBottom: 24,
  },
  resCard: {
    border: "1px solid",
    borderRadius: 8,
    padding: 14,
  },
  resCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  outcomeTag: {
    padding: "2px 8px",
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
  },
  resEventName: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e8ecf4",
    marginBottom: 6,
  },
  resProbRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  resLabel: { fontSize: 9, color: "#5a6070", letterSpacing: 1 },
  resValue: { fontSize: 11, fontWeight: 600, color: "#c8ccd4" },
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
  resultsBtns: { display: "flex", justifyContent: "center", gap: 12 },
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
  // GAME OVER
  gameOverStats: {
    background: "#0d1017",
    border: "1px solid #1a1e28",
    borderRadius: 8,
    padding: "20px 24px",
    marginBottom: 24,
    textAlign: "left",
  },
  goStatRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #12161e",
  },
  goLabel: { fontSize: 11, letterSpacing: 2, color: "#5a6070" },
  goValue: { fontSize: 14, fontWeight: 700, color: "#e8ecf4" },
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
};
