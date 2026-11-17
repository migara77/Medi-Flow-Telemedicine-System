import { useEffect, useState } from 'react';

export default function useAnimatedCounter(value, duration = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    const from = 0;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return n;
}
