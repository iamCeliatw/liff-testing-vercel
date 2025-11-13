"use client";
import liff from "@line/liff";
import { useLiff } from "@/contexts/LiffContext";
// import Lottie from "lottie-react";
// import loadingAnimation from "@/public/loading.json";
import loadingAnimation from "@/public/loading_animation.svg";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function HomeComponent({
  allParams,
}: {
  allParams: Record<string, string>;
}) {
  const { isInitialized, isLoggedIn, profile, login } = useLiff();
  const [paramList, setParamList] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hintOpenChatMessage, setHintOpenChatMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setParamList(allParams);
  }, [allParams]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handlePay = useCallback(async () => {
    try {
      setIsLoading(true);
      const orderId = `ORDER_${Date.now()}`;

      const response = await fetch("/api/line/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 100, // 金額
          orderId,
          productName: "測試商品",
        }),
      });

      const data = await response.json();

      if (data.returnCode === "0000") {
        // 導向到 LINE Pay 付款頁面
        window.location.href = data.info.paymentUrl.web;
      } else {
        alert("付款請求失敗: " + data.returnMessage);
      }
    } catch (error) {
      alert("發生錯誤: " + String(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || !liff.isInClient()) setIsLoading(false);
    return;
  }, [isInitialized]);

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
        {/* parameter list */}
        <div className="parameterList">
          {Object.entries(paramList).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
        {!isInitialized ||
          (isLoading && (
            <div className="loading">
              {/* <Lottie
                animationData={loadingAnimation}
                loop={true}
                style={{ width: 200, height: 150 }}
              /> */}
              <Image
                priority={true}
                src={loadingAnimation}
                alt="loading"
                width={370}
                height={370}
              />
            </div>
          ))}

        {hintOpenChatMessage && <p>{hintOpenChatMessage}</p>}

        {/* {isMounted && !liff.isInClient() && (
          <button onClick={handlePay}>PAY</button>
        )} */}
      </div>
    </div>
  );
}
