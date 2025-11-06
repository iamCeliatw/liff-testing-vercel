import { Client } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";

// 初始化 LINE Bot Client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      );
    }

    // 發送訊息
    await client.pushMessage(userId, {
      type: "text",
      text: message,
    });

    return NextResponse.json({ success: true, message: "Message sent" });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
