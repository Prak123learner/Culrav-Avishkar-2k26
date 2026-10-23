import { useEffect, useMemo, useState } from "react";

function isCached(src) {
  const image = new Image();
  image.src = src;
  return image.complete && image.naturalWidth > 0;
}

/**
 * Holds a route's visual loader only until its above-the-fold images are ready.
 * Cached assets pass synchronously, so returning to that route does not add a
 * loading screen.
 */
export function useImagePreloader(sources) {
  const sourceKey = useMemo(() => sources.join("|"), [sources]);
  const [ready, setReady] = useState(() => sources.every(isCached));

  useEffect(() => {
    let cancelled = false;

    if (sources.every(isCached)) {
      setReady(true);
      return undefined;
    }

    setReady(false);
    let remaining = sources.length;
    const finish = () => {
      remaining -= 1;
      if (remaining === 0 && !cancelled) setReady(true);
    };

    sources.forEach((src) => {
      const image = new Image();
      image.onload = finish;
      image.onerror = finish;
      image.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [sourceKey]); // sourceKey changes whenever the set of required assets does

  return ready;
}
