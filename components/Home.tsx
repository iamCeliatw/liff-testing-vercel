"use client";
import Image from "next/image";
import liff from "@line/liff";
import { useLiff } from "@/contexts/LiffContext";

import { useCallback, useEffect, useState } from "react";

export default function HomeComponent({
  allParams,
}: {
  allParams: Record<string, string>;
}) {
  const { isInitialized, isLoggedIn, profile, login, logout } = useLiff();
  const [paramList, setParamList] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setParamList(allParams);
  }, [allParams]);

  const addFriend = useCallback(() => {
    // 開啟加好友視窗
    if (liff.isInClient()) {
      liff.openWindow({
        url: `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`,
        external: false,
      });
    } else {
      // 在外部瀏覽器開啟
      window.open(
        `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`,
        "_blank"
      );
    }
  }, []);

  const sentMessage = useCallback(
    async (message: string) => {
      try {
        const response = await fetch("/api/line/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: profile?.userId,
            message: message,
          }),
        });
        return response.json();
      } catch (e: unknown) {
        if (e instanceof Error) {
          alert("發生錯誤:" + String(e.message));
        }
      }
    },
    [profile?.userId]
  );

  const handleCheckFriendship = useCallback(async () => {
    if (!profile?.userId) return;
    try {
      // 先檢查是否為好友
      const checkResponse = await fetch("/api/line/check-friendship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.userId,
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkData.isFriend) {
        addFriend();
        return;
      }

      const currentTime = new Date().toLocaleString();
      await sentMessage(
        `Hello ${profile.displayName}! 您已經是我的好友囉~ ${currentTime}`
      );

      // 訊息發送後，開啟官方帳號聊天室
      if (liff.isInClient()) {
        // 在 LINE 內，直接開啟聊天室並關閉 LIFF
        liff.openWindow({
          url: `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`,
          external: false,
        });
        liff.closeWindow();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert("發生錯誤:" + String(e.message));
      }
    }
  }, [profile?.userId, profile?.displayName, addFriend, sentMessage]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      login();
      return;
    }

    if (!isChecked && profile?.userId) {
      setIsChecked(true);
      handleCheckFriendship();
    }
  }, [
    isInitialized,
    isLoggedIn,
    isChecked,
    profile?.userId,
    handleCheckFriendship,
    login,
  ]);

  return (
    <div className="page">
      <div className="header">
        <h1>Liff</h1>
      </div>

      <div className="content">
        {!isLoggedIn ? (
          <>
            <button onClick={login}>Login</button>
            {Object.entries(paramList).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </>
        ) : (
          <div className="userInfo">
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

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
