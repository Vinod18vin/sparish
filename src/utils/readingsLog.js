// Every reading fetched from the ESP32 gets appended here with a
// timestamp, so the History page has something to show. This lives
// in the browser's localStorage, so it persists across refreshes but
// only on this one browser/device — it is not shared between viewers.

const LOG_KEY = "sparish-readings-log";

// ~25 minutes of history at the default 1.5s poll interval. Raise
// this if you want a longer window kept.
const MAX_LOG_ENTRIES = 1000;

export function appendReading(reading) {
  try {
    const existing = getLog();

    const entry = {
      timestamp: Date.now(),
      ph: reading.ph,
      tds: reading.tds,
      turbidity: reading.turbidity,
      temperature: reading.temperature,
    };

    const updated = [...existing, entry].slice(-MAX_LOG_ENTRIES);

    localStorage.setItem(LOG_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save reading to history:", err);
  }
}

export function getLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read history log:", err);
    return [];
  }
}

export function clearLog() {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch (err) {
    console.error("Failed to clear history log:", err);
  }
}