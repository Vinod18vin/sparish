import { useEffect, useRef, useState } from "react";

import { appendReading } from "../utils/readingsLog";
import { ESP32_URL } from "../config/esp32";

const POLL_INTERVAL_MS = 1500;

// ESP32 sends data every 4 seconds.
// If we don't receive a fresh timestamp for 10 seconds,
// consider the device offline.
const OFFLINE_TIMEOUT_MS = 10000;

const HISTORY_LENGTH = 20;

const PARAM_KEYS = ["ph", "tds", "turbidity", "temperature"];

const EMPTY_LATEST = {
  ph: 0,
  tds: 0,
  turbidity: 0,
  temperature: 0,
  lat: null,
  lng: null,
  gpsValid: false,
};

function emptyHistory() {
  return {
    ph: [],
    tds: [],
    turbidity: [],
    temperature: [],
  };
}

export function useLiveReadings() {
  const [latest, setLatest] = useState(EMPTY_LATEST);
  const [history, setHistory] = useState(emptyHistory());

  const [connected, setConnected] = useState(false);

  const historyRef = useRef(emptyHistory());

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(ESP32_URL);

        if (!response.ok) {
          throw new Error(`Firebase responded with ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        // -----------------------------------------
        // CHECK WHETHER ESP32 IS ACTUALLY ONLINE
        // -----------------------------------------

        const lastUpdate = Number(data.lastUpdate || 0);

        const nowSeconds = Math.floor(Date.now() / 1000);

        const ageMs = (nowSeconds - lastUpdate) * 1000;

        const deviceOnline =
          lastUpdate > 0 &&
          ageMs >= 0 &&
          ageMs <= OFFLINE_TIMEOUT_MS;

        // -----------------------------------------
        // DEVICE OFFLINE
        // -----------------------------------------

        if (!deviceOnline) {
          setConnected(false);

          setLatest(EMPTY_LATEST);

          return;
        }

        // -----------------------------------------
        // DEVICE ONLINE
        // -----------------------------------------

        setConnected(true);

        setLatest({
          ph: Number(data.ph) || 0,
          tds: Number(data.tds) || 0,
          turbidity: Number(data.turbidity) || 0,
          temperature: Number(data.temperature) || 0,

          lat:
            typeof data.lat === "number"
              ? data.lat
              : null,

          lng:
            typeof data.lng === "number"
              ? data.lng
              : null,

          gpsValid: Boolean(data.gpsValid),
        });

        // -----------------------------------------
        // UPDATE HISTORY
        // -----------------------------------------

        const next = historyRef.current;

        PARAM_KEYS.forEach((key) => {
          next[key] = [
            ...next[key],
            {
              value: Number(data[key]) || 0,
            },
          ].slice(-HISTORY_LENGTH);
        });

        historyRef.current = next;

        setHistory({ ...next });

        appendReading(data);

      } catch (err) {

        if (!cancelled) {
          setConnected(false);

          // Clear readings when Firebase cannot be reached.
          setLatest(EMPTY_LATEST);
        }

        console.error(
          "Failed to fetch live readings:",
          err
        );
      }
    };

    poll();

    const intervalId = setInterval(
      poll,
      POLL_INTERVAL_MS
    );

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return {
    history,
    latest,
    connected,
  };
}