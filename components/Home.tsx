"use client";
import Image from "next/image";
import { useLiff } from "@/contexts/LiffContext";
export default function HomeComponent() {
  const { isLoggedIn, profile, login, logout } = useLiff();
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
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}
