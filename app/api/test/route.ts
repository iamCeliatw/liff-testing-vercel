import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mgmcode = request.headers.get("mgmcode");

    console.log("收到測試 API 請求");
    console.log("Header mgmcode:", mgmcode);
    console.log("Body:", body);

    return NextResponse.json({
      success: true,
      message: "測試成功",
      receivedMgmcode: mgmcode,
      receivedData: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
