import { NextResponse } from "next/server";

export async function GET() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const checkoutUrl = process.env.CHECKOUT_URL;

  if (!webhookUrl || !checkoutUrl) {
    console.warn("SLACK_WEBHOOK_URL 또는 CHECKOUT_URL이 설정되어 있지 않습니다.");
    return NextResponse.json(
      { ok: false, message: "환경변수가 없습니다." },
      { status: 500 }
    );
  }

  const payload = {
    text: "퇴근 체크 시간입니다.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*퇴근 시간입니다!* 🏠\n오늘 하루 수고하셨습니다. 아래 버튼을 눌러 퇴근을 완료해주세요.",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "퇴근하러 가기",
              emoji: true,
            },
            url: checkoutUrl,
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ ok: true, message: "Slack으로 퇴근 메시지를 보냈습니다." });
  } catch (e) {
    console.error("Slack 퇴근 메시지 전송 실패:", e);
    return NextResponse.json(
      { ok: false, message: "Slack 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}