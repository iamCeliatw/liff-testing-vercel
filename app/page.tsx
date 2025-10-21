"use client";
import liff from "@line/liff";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<{
    displayName: string;
    userId: string;
    pictureUrl?: string;
  } | null>(null);

  useEffect(() => {
    liff
      .init({
        liffId: process.env.NEXT_PUBLIC_LIFF_ID ?? "",
      })
      .then(() => {
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

  const handleLogin = () => {
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  };

  const handleLogout = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Liff</h1>
      </div>

      <div className={styles.content}>
        {!isLoggedIn ? (
          <button onClick={handleLogin}>Login</button>
        ) : (
          <div>
            <h2>User Info</h2>
            {profile ? (
              <>
                <p>Name: {profile.displayName}</p>
                <p>User ID: {profile.userId}</p>
                {profile.pictureUrl && (
                  <>
                    <p>Picture:</p>
                    <Image
                      src={profile.pictureUrl}
                      alt="profile"
                      width={100}
                      height={100}
                    />
                  </>
                )}
              </>
            ) : (
              <p>Loading...</p>
            )}
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
