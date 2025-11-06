"use client";
import Image from "next/image";
import { useLiff } from "@/contexts/LiffContext";

export default function HomeComponent() {
  const { isLoggedIn, profile, login, logout } = useLiff();

  const sendMessage = async () => {
    if (!profile?.userId) return;

    try {
      const response = await fetch("/api/line/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.userId,
          message: "Hello from Next.js API!",
        }),
      });

      const data = await response.json();
      alert(data.success ? "訊息已發送！" : "發送失敗");
    } catch (error) {
      console.error(error);
      alert("發送失敗");
    }
  };
  return (
    <div className="page">
      <div className="header">
        <h1>Liff</h1>
      </div>

      <div className="content">
        {!isLoggedIn ? (
          <button onClick={login}>Login</button>
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
            <button onClick={sendMessage}>發送測試訊息</button>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
