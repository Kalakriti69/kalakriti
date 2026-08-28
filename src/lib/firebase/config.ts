import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase safely (avoid multiple initializations in Next.js SSR / HMR)
export const app = getApps().length > 0 ? getApp() : (firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null);
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export interface StaffSession {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: "admin" | "operator";
  loginTime: string;
}

/**
 * Perform Sign In with Google via Firebase Popup.
 * If Firebase environment variables are not yet set or in offline simulation,
 * it returns a simulated authenticated staff profile so the workflow can be tested immediately.
 */
export async function signInWithGoogle(role: "admin" | "operator"): Promise<StaffSession> {
  if (auth && firebaseConfig.apiKey) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: User = result.user;
      const session: StaffSession = {
        uid: user.uid,
        name: user.displayName || (role === "admin" ? "Govt Admin" : "Yard Operator"),
        email: user.email || (role === "admin" ? "admin@kisansetu.gov.in" : "operator@kisansetu.gov.in"),
        photoURL: user.photoURL || undefined,
        role,
        loginTime: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(`kisanSetu_${role}_session`, JSON.stringify(session));
      }
      return session;
    } catch (err: any) {
      console.warn("Firebase Google Sign-in error/cancelled:", err.message);
      // If user closed the popup deliberately
      if (err.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in cancelled. Please complete Google authentication.");
      }
      // If API key is invalid/restricted, fallback gracefully with notification
      throw new Error(err.message || "Failed to sign in with Google.");
    }
  }

  // Fallback demo authentication when Firebase env variables are pending
  const fallbackSession: StaffSession = {
    uid: `demo-${role}-${Date.now()}`,
    name: role === "admin" ? "Rajesh Sharma (Admin)" : "Manoj Das (APMC Operator)",
    email: role === "admin" ? "rajesh.admin@kisansetu.gov.in" : "manoj.operator@odishamandi.gov.in",
    photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=kisan",
    role,
    loginTime: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(`kisanSetu_${role}_session`, JSON.stringify(fallbackSession));
  }
  return fallbackSession;
}

export async function signOutStaff(role: "admin" | "operator") {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(`kisanSetu_${role}_session`);
  }
}
