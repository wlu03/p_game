import { NextResponse } from "next/server";

// In-memory store (resets on cold start — fine for Vercel serverless)
const scores = [];

export async function POST(request) {
  const body = await request.json();
  const { balance, totalPnL, roundsPlayed, peakBalance, roundHistory } = body;

  const entry = {
    id: scores.length + 1,
    balance,
    totalPnL,
    roundsPlayed,
    peakBalance,
    roundHistory,
    timestamp: new Date().toISOString(),
  };
  scores.push(entry);

  return NextResponse.json({ success: true, id: entry.id });
}

export async function GET() {
  const recent = scores.slice(-50).reverse();
  return NextResponse.json(recent);
}
