"use client";
import liff from "@line/liff";
import { useLiff } from "@/contexts/LiffContext";
import loadingAnimation from "@/public/loading_animation.svg";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { callApi } from "@/utils/api";
export default function HomeComponent({
  allParams,
}: {
  allParams: Record<string, string>;
}) {
  const { isInitialized, isLoggedIn, profile, login } = useLiff();
  const [paramList, setParamList] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hintOpenChatMessage, setHintOpenChatMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const mgmcode = allParams.mgmcode; // 從 URL 參數取得 mgmcode

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

  const openChat = useCallback(() => {
    liff.openWindow({
      url: `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`,
      external: false,
    });
  }, []);

  const sentMessage = useCallback(
    async (message: string) => {
      try {
        const response = await callApi(
          "/api/line/send-message",
          "POST",
          {
            userId: profile?.userId,
            message: message,
          },
          mgmcode
        );
        return response;
      } catch (e: unknown) {
        if (e instanceof Error) {
          alert("發生錯誤:" + String(e.message));
        }
        throw e;
      }
    },
    [profile?.userId, mgmcode]
  );

  const handleCheckFriendship = useCallback(async () => {
    if (!profile?.userId) return;

    // 檢查是否已經處理過，避免循環
    const storageKey = `liff_checked_${profile.userId}`;
    const hasChecked = sessionStorage.getItem(storageKey);
    if (hasChecked) {
      setIsLoading(false);
      return;
    }

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
      // 標記已處理，避免循環
      sessionStorage.setItem(storageKey, "true");

      // 訊息發送後，開啟官方帳號聊天室
      if (liff.isInClient()) {
        openChat();
      } else {
        // 在外部瀏覽器也開啟聊天室
        window.location.href = `https://line.me/R/ti/p/${process.env.NEXT_PUBLIC_LINE_BOT_ID}`;
        setIsLoading(false);
        setHintOpenChatMessage("已開啟聊天室");
      }
    } catch (e: unknown) {
      setIsLoading(false);
      if (e instanceof Error) {
        alert("發生錯誤:" + String(e.message));
      }
    }
  }, [profile?.userId, profile?.displayName, addFriend, sentMessage, openChat]);

  const testApiCall = useCallback(async () => {
    try {
      const response = await callApi(
        "/api/test",
        "POST",
        {
          userId: profile?.userId,
          displayName: profile?.displayName,
          message: "Line 登入成功測試",
        },
        mgmcode
      );
      console.log("測試 API 回應:", response);
    } catch (error) {
      console.error("測試 API 錯誤:", error);
    }
  }, [profile?.userId, profile?.displayName, mgmcode]);

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
      testApiCall(); // 登入後打測試 API
      handleCheckFriendship();
    }
  }, [
    isInitialized,
    isLoggedIn,
    isChecked,
    profile?.userId,
    handleCheckFriendship,
    testApiCall,
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
