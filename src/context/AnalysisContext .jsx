import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "quantlab:last-analysis";
const OPTIONS_KEY = "quantlab:options-cache";
const AnalysisContext = createContext(null);

function readFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { result: null, meta: null };
  } catch {
    return { result: null, meta: null };
  }
}

function readOptionsFromStorage() {
  try {
    const raw = sessionStorage.getItem(OPTIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Wraps the app and holds:
 *  - the most recent analysis result + meta (strategy/pair/timeframe/etc)
 *  - the cached dropdown options (trading pairs/strategies/timeframes)
 *
 * Both are backed by sessionStorage, so they survive a page refresh but
 * clear naturally when the tab/browser closes — no manual cache-busting
 * needed if the backend adds a new strategy tomorrow.
 */
export function AnalysisProvider({ children }) {
  const [state, setState] = useState(readFromStorage);
  const [options, setOptionsState] = useState(readOptionsFromStorage);

  const setAnalysis = useCallback((result, meta) => {
    const next = { result, meta };
    setState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // sessionStorage unavailable (e.g. private mode) — in-memory state still works
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({ result: null, meta: null });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
  }, []);

  const setOptions = useCallback((data) => {
    setOptionsState(data);
    try {
      sessionStorage.setItem(OPTIONS_KEY, JSON.stringify(data));
    } catch {
      /* no-op */
    }
  }, []);

  // Keep tabs in sync if the user runs a new analysis in another tab.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setState(readFromStorage());
      if (e.key === OPTIONS_KEY) setOptionsState(readOptionsFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{ ...state, setAnalysis, clearAnalysis, options, setOptions }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within an AnalysisProvider");
  return ctx;
}