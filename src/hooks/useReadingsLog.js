import { useEffect, useState } from "react";

import { getLog, clearLog as clearStoredLog } from "../utils/readingsLog";

// How often the History page re-checks storage for new entries while
// it's open, so it keeps updating without a manual refresh.
const REFRESH_INTERVAL_MS = 2000;

export function useReadingsLog() {
  const [entries, setEntries] = useState(() => getLog());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEntries(getLog());
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  const clearLog = () => {
    clearStoredLog();
    setEntries([]);
  };

  // Newest reading first.
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return { entries: sorted, clearLog };
}