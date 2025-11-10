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
    try {
      await client.getProfile(userId);
      return NextResponse.json({
        isFriend: true,
        userId,
      });
    } catch {
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
