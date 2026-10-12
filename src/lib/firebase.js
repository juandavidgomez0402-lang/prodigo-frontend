import { initializeApp } from "firebase/app"
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth"

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAOoX5_fSNzw0pfcChK2gu4Asf1Pyevp4U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "prodigo-b1924.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "prodigo-b1924",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "prodigo-b1924.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "264941096158",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:264941096158:web:3385a095c4d7571a80464f",
}

export const firebaseReady = ["apiKey", "authDomain", "projectId", "appId"].every(
  (key) => typeof config[key] === "string" && config[key].length > 0,
)

export const auth = firebaseReady ? getAuth(initializeApp(config)) : null

export const authReady = auth
  ? setPersistence(auth, browserLocalPersistence)
  : Promise.resolve()

export async function signInAdmin(email, password) {
  await setPersistence(auth, browserLocalPersistence)
  return signInWithEmailAndPassword(auth, email, password)
}
