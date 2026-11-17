import { useEffect, useRef } from 'react';

/**
 * usePolling: runs `fn` immediately + every `interval` ms while the tab is visible.
 * Pauses when the tab is hidden to avoid wasted calls.
 */
export default function usePolling(fn, interval = 10000, deps = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState !== 'visible') return;
      try { await fnRef.current(); } catch {}
    };

    const schedule = () => {
      clearInterval(timer);
      timer = setInterval(tick, interval);
    };

    tick();
    schedule();

    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps]);
}
