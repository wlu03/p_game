"use client";

import { useState, useEffect, useRef } from "react";
import { ROUND_TIME, INITIAL_BALANCE } from "@/lib/constants";
import { placeTrade, resolveRound } from "@/lib/game-logic";
import { saveSettings, loadSettings, saveLastScore, loadLastScore } from "@/lib/storage";
import MenuScreen from "./MenuScreen";
import PlayingScreen from "./PlayingScreen";
import ResultsScreen from "./ResultsScreen";
import GameOverScreen from "./GameOverScreen";

function logEvent(type, data) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, data }),
  }).catch(() => {});
}

export default function GameClient() {
  const [screen, setScreen] = useState("menu");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [round, setRound] = useState(1);
  const [events, setEvents] = useState([]);
  const [positions, setPositions] = useState({});
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [roundHistory, setRoundHistory] = useState([]);
  const [resolutions, setResolutions] = useState(null);
  const [totalPnL, setTotalPnL] = useState(0);
  const [tradeSize, setTradeSize] = useState(1000);
  const [peakBalance, setPeakBalance] = useState(INITIAL_BALANCE);
  const [showTrueProbs, setShowTrueProbs] = useState(false);
  const [lastScore, setLastScore] = useState(null);
  const timerRef = useRef(null);
  // Track trueProbs separately (fetched with debug param, kept client-side for reveal)
  const trueProbsRef = useRef({});

  // Load settings + last score from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    if (settings) {
      if (settings.tradeSize) setTradeSize(settings.tradeSize);
    }
    const score = loadLastScore();
    if (score) setLastScore(score);
  }, []);

  // Persist settings on change
  useEffect(() => {
    saveSettings({ tradeSize });
  }, [tradeSize]);

  // Timer
  useEffect(() => {
    if (screen === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (screen === "playing" && timeLeft === 0) {
      handleResolve();
    }
  }, [screen, timeLeft]);

  async function fetchEvents() {
    try {
      // Fetch without true probs for the game
      const res = await fetch("/api/questions");
      const data = await res.json();

      // Also fetch with true probs for resolution
      const resTrue = await fetch("/api/questions?includeTrue=1");
      const dataTrue = await resTrue.json();

      // We need the same events, so we'll generate once server-side
      // Instead, let's use a single fetch that includes trueProb but we
      // hide it in the UI until revealed
      return dataTrue;
    } catch {
      // Fallback to client-side generation if API fails
      const { generateEvents } = await import("@/lib/game-logic");
      return generateEvents();
    }
  }

  async function startGame() {
    const newEvents = await fetchEvents();
    setBalance(INITIAL_BALANCE);
    setRound(1);
    setPositions({});
    setRoundHistory([]);
    setTotalPnL(0);
    setPeakBalance(INITIAL_BALANCE);
    setShowTrueProbs(false);
    setEvents(newEvents);
    setTimeLeft(ROUND_TIME);
    setScreen("playing");

    logEvent("game_start", { balance: INITIAL_BALANCE });
  }

  function handleTrade(eventId, side) {
    const result = placeTrade(positions, eventId, side, events, tradeSize, balance);
    setPositions(result.positions);
    setBalance(result.balance);

    logEvent("trade", {
      eventId,
      side,
      tradeSize,
      eventName: events.find((e) => e.id === eventId)?.name,
    });
  }

  function handleResolve() {
    clearTimeout(timerRef.current);
    const { resolved, tradeResults, roundPnL, returnedCapital } = resolveRound(events, positions);

    const newBalance = balance + returnedCapital + roundPnL;
    const newTotal = totalPnL + roundPnL;

    setResolutions({ events: resolved, trades: tradeResults, roundPnL, returnedCapital });
    setRoundHistory((prev) => [...prev, { round, pnl: roundPnL, balance: newBalance }]);
    setBalance(newBalance);
    setTotalPnL(newTotal);
    setPeakBalance((p) => Math.max(p, newBalance));
    setPositions({});

    logEvent("round_resolve", {
      round,
      roundPnL,
      newBalance,
      tradeCount: tradeResults.length,
    });

    if (newBalance <= 0) {
      finishGame(newBalance, newTotal, round);
      setScreen("gameover");
    } else {
      setScreen("results");
    }
  }

  async function nextRound() {
    const newEvents = await fetchEvents();
    setRound((r) => r + 1);
    setEvents(newEvents);
    setTimeLeft(ROUND_TIME);
    setResolutions(null);
    setShowTrueProbs(false);
    setScreen("playing");

    logEvent("round_start", { round: round + 1 });
  }

  function endGame() {
    finishGame(balance, totalPnL, round);
    setScreen("gameover");
  }

  function finishGame(finalBalance, finalPnL, roundsPlayed) {
    const score = {
      balance: finalBalance,
      totalPnL: finalPnL,
      roundsPlayed,
      peakBalance: Math.max(peakBalance, finalBalance),
    };
    saveLastScore(score);
    setLastScore(score);

    // Record score to backend
    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...score,
        roundHistory: [...roundHistory, { round: roundsPlayed, pnl: 0, balance: finalBalance }],
      }),
    }).catch(() => {});

    logEvent("game_end", score);
  }

  if (screen === "menu") {
    return <MenuScreen onStart={startGame} lastScore={lastScore} />;
  }

  if (screen === "playing") {
    return (
      <PlayingScreen
        round={round}
        timeLeft={timeLeft}
        balance={balance}
        totalPnL={totalPnL}
        events={events}
        positions={positions}
        tradeSize={tradeSize}
        showTrueProbs={showTrueProbs}
        onSetTradeSize={setTradeSize}
        onToggleTrueProbs={() => setShowTrueProbs((p) => !p)}
        onTrade={handleTrade}
        onResolve={handleResolve}
        onQuit={endGame}
      />
    );
  }

  if (screen === "results" && resolutions) {
    return (
      <ResultsScreen
        round={round}
        resolutions={resolutions}
        balance={balance}
        totalPnL={totalPnL}
        peakBalance={peakBalance}
        onNextRound={nextRound}
        onEndGame={endGame}
      />
    );
  }

  if (screen === "gameover") {
    return (
      <GameOverScreen
        balance={balance}
        totalPnL={totalPnL}
        round={round}
        peakBalance={peakBalance}
        roundHistory={roundHistory}
        onPlayAgain={startGame}
      />
    );
  }

  return null;
}
