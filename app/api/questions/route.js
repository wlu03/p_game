import { NextResponse } from "next/server";
import { generateEvents } from "@/lib/game-logic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeTrue = searchParams.get("includeTrue") === "1";

  const events = generateEvents();

  if (!includeTrue) {
    const sanitized = events.map(({ trueProb, ...rest }) => rest);
    return NextResponse.json(sanitized);
  }

  return NextResponse.json(events);
}
