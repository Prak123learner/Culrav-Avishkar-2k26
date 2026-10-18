import { getApps, initializeApp } from "firebase/app";
import { authDiagnostic, tracePopupOpen } from "./authDiagnostics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

const app = firebaseConfigured
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;
const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();
let preparation;

provider.setCustomParameters({ prompt: "select_account" });

export function prepareGoogleSignIn() {
  authDiagnostic("preparation:start", {
    origin: window.location.origin,
    authDomain: firebaseConfig.authDomain,
    configured: firebaseConfigured,
    secureContext: window.isSecureContext,
    embedded: window.self !== window.top,
    mode: import.meta.env.MODE,
    browser: navigator.userAgent,
  });
  if (!auth)
    return Promise.reject(new Error("Firebase sign-in is not configured"));
  if (!preparation) {
    // Connection hints only: Firebase still owns its helper iframe and popup.
    // Run on the login page, before a participant clicks the sign-in button.
    for (const origin of [
      `https://${firebaseConfig.authDomain}`,
      "https://apis.google.com",
      "https://accounts.google.com",
    ]) {
      if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`))
        continue;
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = origin;
      document.head.appendChild(link);
    }
    preparation = auth
      .authStateReady()
      .then(async () => {
        authDiagnostic("preparation:auth-state-ready");
        // Firebase 12.19 initializes this helper lazily on desktop browsers.
        // That network wait can consume Edge's transient user activation before
        // window.open. Warm the SDK-owned helper here, never opening a window.
        // This guarded internal adapter must be rechecked when upgrading Firebase.
        const resolver = auth._popupRedirectResolver;
        if (typeof resolver?._initialize !== "function")
          throw new Error(
            "Google sign-in preparation is unavailable. Please contact the festival administrator.",
          );
        await resolver._initialize(auth);
        authDiagnostic("preparation:popup-helper-ready");
      })
      .catch((error) => {
        authDiagnostic("preparation:failed", {
          code: error?.code,
          errorName: error?.name,
        });
        preparation = null;
        throw error;
      });
  }
  return preparation;
}

export function signInWithGooglePopup() {
  if (!auth) throw new Error("Firebase sign-in is not configured");
  // This runs synchronously from the button click, preserving user activation.
  authDiagnostic("popup:start");
  const stopTracing = tracePopupOpen();
  try {
    return signInWithPopup(auth, provider)
      .then(
        (result) => {
          authDiagnostic("popup:success");
          return result;
        },
        (error) => {
          authDiagnostic("popup:failed", {
            code: error?.code,
            errorName: error?.name,
          });
          throw error;
        },
      )
      .finally(stopTracing);
  } catch (error) {
    stopTracing();
    throw error;
  }
}

export function signOutOfFirebase() {
  return auth ? signOut(auth) : Promise.resolve();
}
