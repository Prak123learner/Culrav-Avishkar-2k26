import { useEffect, useState } from "react";

const loadedImages = new Set();
const imageRequests = new Map();

function isReady(src) {
  if (loadedImages.has(src)) return true;
  const image = new Image();
  image.src = src;
  if (image.complete && image.naturalWidth > 0) {
    loadedImages.add(src);
    return true;
  }
  return false;
}

function warmImage(src) {
  if (isReady(src)) return Promise.resolve();
  if (imageRequests.has(src)) return imageRequests.get(src);

  const request = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      loadedImages.add(src);
      imageRequests.delete(src);
      resolve();
    };
    image.onerror = () => {
      imageRequests.delete(src);
      resolve(); // A missing decorative image must not trap the route.
    };
    image.src = src;
  });
  imageRequests.set(src, request);
  return request;
}

export function warmImages(sources) {
  return Promise.all(sources.filter(Boolean).map(warmImage));
}

/** Show the route loader only while its visible images are genuinely cold. */
export function useImagePreloader(sources) {
  const sourceKey = sources.join("|");
  const [ready, setReady] = useState(() => sources.every(isReady));

  useEffect(() => {
    let active = true;
    const requestedSources = sourceKey ? sourceKey.split("|") : [];
    if (requestedSources.every(isReady)) {
      setReady(true);
    } else {
      setReady(false);
      warmImages(requestedSources).then(() => {
        if (active) setReady(true);
      });
    }
    return () => {
      active = false;
    };
  }, [sourceKey]);

  return ready;
}
