import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, orderId, productName } = await req.json();

    const channelId = process.env.LINE_PAY_CHANNEL_ID!;
    const channelSecret = process.env.LINE_PAY_CHANNEL_SECRET!;
    const requestUrl = "https://sandbox-api-pay.line.me/v3/payments/request"; // 測試環境
    const uri = "/v3/payments/request"; // URI path for signature

    const body = {
      amount,
      currency: "TWD",
      orderId,
      packages: [
        {
          id: "1",
          amount,
          products: [
            {
              name: productName,
              quantity: 1,
              price: amount,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/line/payment/confirm`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?status=cancel`,
      },
    };

    const nonce = crypto.randomUUID();
    const bodyString = JSON.stringify(body);
    const signature = crypto
      .createHmac("sha256", channelSecret)
      .update(channelSecret + uri + bodyString + nonce)
      .digest("base64");

    const response = await fetch(requestUrl, {
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
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
