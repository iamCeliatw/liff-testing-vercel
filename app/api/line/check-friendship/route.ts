import { Client } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 嘗試取得用戶 profile，如果成功代表是好友
    try {
      await client.getProfile(userId);
      return NextResponse.json({
        isFriend: true,
        userId,
      });
    } catch {
      // 無法取得 profile，代表不是好友或 userId 無效
      return NextResponse.json({
        isFriend: false,
        userId,
      });
    }
  } catch (error) {
    console.error("Error checking friendship:", error);
    return NextResponse.json(
      { error: "Failed to check friendship", isFriend: false },
      { status: 500 }
    );
  }
}
