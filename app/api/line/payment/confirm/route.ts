import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");
    const orderId = searchParams.get("orderId");

    if (!transactionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}?status=error`
      );
    }

    const channelId = process.env.LINE_PAY_CHANNEL_ID!;
    const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET!;
    const confirmUrl = `https://sandbox-api-pay.line.me/v3/payments/${transactionId}/confirm`;
    const uri = `/v3/payments/${transactionId}/confirm`; // URI path for signature

    // 從你的資料庫取得訂單金額
    const amount = 100; // TODO: 這裡應該從資料庫取得實際金額

    const body = { amount, currency: "TWD" };
    const nonce = crypto.randomUUID();
    const bodyString = JSON.stringify(body);
    const signature = crypto
      .createHmac("sha256", channelSecret)
      .update(channelSecret + uri + bodyString + nonce)
      .digest("base64");

    const response = await fetch(confirmUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": channelId,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature,
      },
      body: bodyString,
    });

    const data = await response.json();

    if (data.returnCode === "0000") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}?status=success&orderId=${orderId}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}?status=error`
      );
    }
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}?status=error`
    );
  }
}
