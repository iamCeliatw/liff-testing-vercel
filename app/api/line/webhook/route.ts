import { Client, WebhookEvent } from "@line/bot-sdk";
import { NextRequest, NextResponse } from "next/server";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

const client = new Client(config);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events;

    // 處理每個事件
    await Promise.all(
      events.map(async (event) => {
        // 印出所有事件
        console.log("收到事件:", JSON.stringify(event, null, 2));

        // 處理加好友事件
        if (event.type === "follow") {
          console.log(`用戶 ${event.source.userId} 加入好友`);

          // 發送歡迎訊息
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `歡迎加入！感謝成為我的好友 🎉`,
          });
        }

        // 處理文字訊息
        if (event.type === "message" && event.message.type === "text") {
          console.log(`用戶 ${event.source.userId} 說: ${event.message.text}`);

          // 回覆訊息
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `你說: ${event.message.text}`,
          });
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
