const isBrowser = typeof window !== "undefined";

export function saveSettings(settings) {
  if (!isBrowser) return;
  try {
    localStorage.setItem("prob-exchange-settings", JSON.stringify(settings));
  } catch {}
}

export function loadSettings() {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem("prob-exchange-settings");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastScore(score) {
  if (!isBrowser) return;
  try {
    localStorage.setItem("prob-exchange-last-score", JSON.stringify(score));
  } catch {}
}

export function loadLastScore() {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem("prob-exchange-last-score");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
