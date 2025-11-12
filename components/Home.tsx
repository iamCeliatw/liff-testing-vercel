"use client";
import liff from "@line/liff";
import { useLiff } from "@/contexts/LiffContext";
import Lottie from "lottie-react";
import loadingAnimation from "@/public/loading.json";

import { useCallback, useEffect, useState } from "react";

export default function HomeComponent({
  allParams,
}: {
  allParams: Record<string, string>;
}) {
  const { isInitialized, isLoggedIn, profile, login } = useLiff();
  const [paramList, setParamList] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hintOpenChatMessage, setHintOpenChatMessage] = useState("");
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
    setIsLoading(true);
    try {
      // 先檢查是否為好友
      // liff.getFriendship().then((friendship) => {
      //   if (!friendship.friendFlag) {
      //     setIsLoading(false);
      //     addFriend();
      //     return;
      //   }
      // });
      const friendship = await liff.getFriendship();
      if (!friendship?.friendFlag) {
        setIsLoading(false);
        addFriend();
        return;
      }

      const currentTime = new Date().toLocaleString();
      await sentMessage(
        `Hello ${profile.displayName}! 您已經是我的好友囉~ ${currentTime}`
      );

      // 訊息發送後，開啟官方帳號聊天室
      if (liff.isInClient()) {
        openChat();
      } else {
        setIsLoading(false);
        setHintOpenChatMessage("請開啟手機查看");
      }
    } catch (e: unknown) {
      setIsLoading(false);
      if (e instanceof Error) {
        alert("發生錯誤:" + String(e.message));
      }
    }
  }, [profile?.userId, profile?.displayName, addFriend, sentMessage]);

  const openChat = useCallback(() => {
    liff.openWindow({
      url: `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`,
      external: false,
    });
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      setIsLoading(false);
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
        {hintOpenChatMessage && <p>{hintOpenChatMessage}</p>}
        {!isInitialized || isLoading ? (
          <div className="loading">
            <Lottie
              animationData={loadingAnimation}
              loop={true}
              style={{ width: 200, height: 150 }}
            />
          </div>
        ) : !isLoggedIn ? (
          <>
            <button onClick={login}>Login</button>
            {Object.entries(paramList).map(([key, value]) => (
              <p key={key}>
                {key}: {value}
              </p>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
