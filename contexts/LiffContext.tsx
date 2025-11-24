"use client";
import liff from "@line/liff";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface LiffProfile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
}

interface LiffContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  login: () => void;
  logout: () => void;
}

const LiffContext = createContext<LiffContextType | undefined>(undefined);

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);

  useEffect(() => {
    liff
      .init({
        liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "",
      })
      .then(() => {
        setIsInitialized(true);
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          liff.getProfile().then((profile) => {
            setProfile(profile);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const login = useCallback(() => {
    if (!liff.isLoggedIn()) {
      // 保留當前 URL 的 query parameters (包括 token)
      const currentUrl = window.location.href;
      liff.login({ redirectUri: currentUrl });
    }
  }, []);

  const logout = useCallback(() => {
    if (liff.isLoggedIn()) {
      liff.logout();
      setIsLoggedIn(false);
      setProfile(null);
    }
  }, []);

  return (
    <LiffContext.Provider
      value={{ isInitialized, isLoggedIn, profile, login, logout }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (context === undefined) {
    throw new Error("useLiff must be used within a LiffProvider");
  }
  return context;
}
