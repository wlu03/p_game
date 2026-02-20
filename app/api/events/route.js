import { NextResponse } from "next/server";

// In-memory event log (resets on cold start)
const eventLog = [];

export async function POST(request) {
  const body = await request.json();
  const { type, data } = body;

  const validTypes = ["game_start", "round_start", "trade", "round_resolve", "game_end"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const entry = {
    id: eventLog.length + 1,
    type,
    data,
    timestamp: new Date().toISOString(),
  };
  eventLog.push(entry);

  return NextResponse.json({ success: true, id: entry.id });
}

export async function GET() {
  const recent = eventLog.slice(-100).reverse();
  return NextResponse.json(recent);
}
