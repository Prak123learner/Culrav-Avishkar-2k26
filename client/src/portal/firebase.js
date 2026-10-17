import { getApps, initializeApp } from "firebase/app";
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

provider.setCustomParameters({ prompt: "select_account" });

export function signInWithGooglePopup() {
  if (!auth) throw new Error("Firebase sign-in is not configured");
  // This runs synchronously from the button click, preserving user activation.
  return signInWithPopup(auth, provider);
}

export function signOutOfFirebase() {
  return auth ? signOut(auth) : Promise.resolve();
}
