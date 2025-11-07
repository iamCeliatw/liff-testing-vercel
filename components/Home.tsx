"use client";
import Image from "next/image";
import liff from "@line/liff";
import { useLiff } from "@/contexts/LiffContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeComponent() {
  const { isLoggedIn, profile, login, logout } = useLiff();
  const [paramList, setParamList] = useState<Record<string, string>>({});
  const currentTime = new Date().toLocaleString();
  const searchParams = useSearchParams();

  useEffect(() => {
    const allParams = Object.fromEntries(searchParams.entries());
    setParamList(allParams);
  }, [searchParams]);

  const addFriend = () => {
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
  };

  const sentMessage = async (message: string) => {
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
  };
  const handleSendMessage = async () => {
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
        const shouldAddFriend = confirm(
          "請先加入官方帳號好友才能接收訊息！\n是否前往加入好友？"
        );
        if (shouldAddFriend) {
          addFriend();
        }
        return;
      }

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
  };
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
            <button onClick={handleSendMessage}>加入好友</button>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
