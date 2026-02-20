// All 42 probability events for the market-making simulator
export const allEvents = [
  // Coin events
  { name: "3 Heads in a Row (3 flips)", trueProb: 0.125, category: "COIN" },
  { name: "At Least 2 Tails in 5 Flips", trueProb: 1 - (Math.pow(0.5, 5) + 5 * Math.pow(0.5, 5)), category: "COIN" },
  { name: "Exactly 1 Head in 4 Flips", trueProb: 4 * 0.5 * Math.pow(0.5, 3), category: "COIN" },
  { name: "All Same Side in 4 Flips", trueProb: 2 * Math.pow(0.5, 4), category: "COIN" },
  { name: "More Heads Than Tails (5 Flips)", trueProb: 0.5, category: "COIN" },
  { name: "No Heads in 3 Flips", trueProb: 0.125, category: "COIN" },
  { name: "Alternating H/T in 4 Flips", trueProb: 2 * Math.pow(0.5, 4), category: "COIN" },
  // Dice events
  { name: "Roll a 6 (Single Die)", trueProb: 1 / 6, category: "DICE" },
  { name: "Sum of 2 Dice > 8", trueProb: 10 / 36, category: "DICE" },
  { name: "Rolling Doubles (2 Dice)", trueProb: 6 / 36, category: "DICE" },
  { name: "At Least One 1 in 3 Rolls", trueProb: 1 - Math.pow(5 / 6, 3), category: "DICE" },
  { name: "Sum of 2 Dice = 7", trueProb: 6 / 36, category: "DICE" },
  { name: "All Dice > 3 (2 Dice)", trueProb: Math.pow(3 / 6, 2), category: "DICE" },
  { name: "Sum of 3 Dice ≥ 15", trueProb: 20 / 216, category: "DICE" },
  { name: "No 6s in 4 Rolls", trueProb: Math.pow(5 / 6, 4), category: "DICE" },
  { name: "Exactly Two 6s in 5 Rolls", trueProb: 10 * Math.pow(1 / 6, 2) * Math.pow(5 / 6, 3), category: "DICE" },
  // Card events
  { name: "Draw an Ace (from 52)", trueProb: 4 / 52, category: "CARD" },
  { name: "Draw a Red Card", trueProb: 26 / 52, category: "CARD" },
  { name: "Draw a Face Card (J/Q/K)", trueProb: 12 / 52, category: "CARD" },
  { name: "Draw a Spade", trueProb: 13 / 52, category: "CARD" },
  { name: "Draw a Card > 8 (incl. face)", trueProb: 24 / 52, category: "CARD" },
  { name: "Draw 2 Cards, Both Red", trueProb: (26 / 52) * (25 / 51), category: "CARD" },
  { name: "Draw 2 Cards, Same Suit", trueProb: 4 * (13 / 52) * (12 / 51), category: "CARD" },
  { name: "Draw a Prime Number Card (2,3,5,7)", trueProb: 16 / 52, category: "CARD" },
  { name: "Draw King or Queen", trueProb: 8 / 52, category: "CARD" },
  // Mixed / advanced
  { name: "Heads AND Die > 4", trueProb: 0.5 * (2 / 6), category: "MIXED" },
  { name: "Tails OR Die = 1", trueProb: 0.5 + 1 / 6 - (0.5 * 1 / 6), category: "MIXED" },
  { name: "Red Card AND Heads", trueProb: 0.5 * 0.5, category: "MIXED" },
  { name: "Die ≤ 2 AND Card is Ace", trueProb: (2 / 6) * (4 / 52), category: "MIXED" },
  { name: "At Least 1 of: Heads, Die=6, Ace", trueProb: 1 - 0.5 * (5 / 6) * (48 / 52), category: "MIXED" },
  { name: "Heads AND Die > 2 AND Red Card", trueProb: 0.5 * (4 / 6) * 0.5, category: "MIXED" },
];
