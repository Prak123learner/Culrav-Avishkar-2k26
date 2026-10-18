// Opt-in browser-only diagnostics. Never log credentials, tokens or account data.
export const authDebugEnabled = () =>
  new URLSearchParams(window.location.search).get("authDebug") === "1";

export function authDiagnostic(stage, details = {}) {
  if (!authDebugEnabled()) return;
  console.info("[CA auth debug v1]", stage, {
    elapsedMs: Math.round(performance.now()),
    userActivation: navigator.userActivation?.isActive ?? null,
    ...details,
  });
}

export function tracePopupOpen() {
  if (!authDebugEnabled()) return () => {};
  const original = window.open;
  function tracedOpen(...args) {
    authDiagnostic("window.open:called");
    try {
      const popup = Reflect.apply(original, this, args);
      authDiagnostic("window.open:returned", { windowReturned: !!popup });
      return popup;
    } catch (error) {
      authDiagnostic("window.open:threw", { errorName: error?.name });
      throw error;
    }
  }
  window.open = tracedOpen;
  return () => {
    if (window.open === tracedOpen) window.open = original;
  };
}
