import { getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // On Vercel the auth helper is proxied through this same hostname.
  authDomain: import.meta.env.PROD
    ? window.location.hostname
    : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
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
let redirectResultPromise;

provider.setCustomParameters({ prompt: "select_account" });

export function signInWithGooglePopup() {
  if (!auth) throw new Error("Firebase sign-in is not configured");
  // This runs synchronously from the button click, preserving user activation.
  return signInWithPopup(auth, provider);
}

export function signInWithGoogleRedirect() {
  if (!auth) throw new Error("Firebase sign-in is not configured");
  return signInWithRedirect(auth, provider);
}

export function getGoogleRedirectResult() {
  if (!auth) return Promise.resolve(null);
  // React Strict Mode can mount the login effect twice. Both runs must share
  // the same redirect result rather than consuming it on the first run only.
  redirectResultPromise ??= getRedirectResult(auth);
  return redirectResultPromise;
}

export function signOutOfFirebase() {
  return auth ? signOut(auth) : Promise.resolve();
}
