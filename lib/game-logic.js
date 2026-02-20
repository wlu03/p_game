import { allEvents } from "@/data/events";

export function generateEvents() {
  const count = 20;
  const shuffled = [...allEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((evt, i) => {
    const mispricing = (Math.random() - 0.5) * 0.20;
    const spread = 0.02 + Math.random() * 0.06;
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
}

export function placeTrade(positions, eventId, side, events, tradeSize, balance) {
  const evt = events.find((e) => e.id === eventId);
  if (!evt) return { positions, balance };
  const cost = tradeSize;
  if (cost > balance) return { positions, balance };

  const existing = positions[eventId];
  let newPositions;

  if (existing && existing.side !== side) {
    const { [eventId]: _, ...rest } = positions;
    newPositions = rest;
  } else if (existing && existing.side === side) {
    const price = side === "buy" ? evt.ask : evt.bid;
    newPositions = {
      ...positions,
      [eventId]: {
        ...existing,
        qty: existing.qty + cost,
        price: (existing.price * existing.qty + price * cost) / (existing.qty + cost),
      },
    };
  } else {
    const price = side === "buy" ? evt.ask : evt.bid;
    newPositions = { ...positions, [eventId]: { side, qty: cost, price } };
  }

  return { positions: newPositions, balance: balance - cost };
}

export function resolveRound(events, positions) {
  const resolved = events.map((evt) => {
    const happened = Math.random() < evt.trueProb;
    return { ...evt, happened };
  });

  let roundPnL = 0;
  const tradeResults = [];

  Object.entries(positions).forEach(([eid, pos]) => {
    const evt = resolved.find((e) => e.id === parseInt(eid));
    if (!evt) return;
    const payout = evt.happened ? 1 : 0;
    let pnl;
    if (pos.side === "buy") {
      pnl = pos.qty * (payout - pos.price) / pos.price;
    } else {
      pnl = pos.qty * (pos.price - payout) / pos.price;
    }
    roundPnL += pnl;
    tradeResults.push({
      event: evt.name,
      side: pos.side,
      qty: pos.qty,
      price: pos.price,
      happened: evt.happened,
      pnl,
    });
  });

  let returnedCapital = 0;
  Object.values(positions).forEach((pos) => {
    returnedCapital += pos.qty;
  });

  return { resolved, tradeResults, roundPnL, returnedCapital };
}
