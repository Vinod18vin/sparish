import { useEffect, useState } from "react";

import { ESP32_URL } from "../config/esp32";

const CHECK_INTERVAL_MS = 3000;

// ESP32 uploads every 4 seconds.
// Anything older than 10 seconds is considered offline.
const OFFLINE_TIMEOUT_MS = 10000;

export function useDeviceConnection() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const response = await fetch(ESP32_URL);

        if (!response.ok) {
          throw new Error(
            `Firebase responded with ${response.status}`
          );
        }

        const data = await response.json();

        // -----------------------------------------
        // CHECK LAST ESP32 UPDATE
        // -----------------------------------------

        const lastUpdate = Number(
          data.lastUpdate || 0
        );

        const nowSeconds = Math.floor(
          Date.now() / 1000
        );

        const ageMs =
          (nowSeconds - lastUpdate) * 1000;

        const deviceOnline =
          lastUpdate > 0 &&
          ageMs >= 0 &&
          ageMs <= OFFLINE_TIMEOUT_MS;

        if (!cancelled) {
          setConnected(deviceOnline);
        }

      } catch {
        if (!cancelled) {
          setConnected(false);
        }
      }
    };

    check();

    const intervalId = setInterval(
      check,
      CHECK_INTERVAL_MS
    );

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return connected;
}