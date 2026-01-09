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

    await Promise.all(
      events.map(async (event) => {
        // if (event.type === "follow") {
        // console.log(`用戶 ${event.source.userId} 加入好友`);
        // await client.replyMessage(event.replyToken, [
        //   {
        //     type: "text",
        //     text: `你是不是剛才追蹤了我啊😊`,
        //   },
        //   {
        //     type: "text",
        //     text: `追蹤要付錢的喔 每個月100元`,
        //   },
        // ]);
        // }

        if (event.type === "message" && event.message.type === "text") {
          console.log(`用戶 ${event.source.userId} 說: ${event.message.text}`);

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
