import { NextResponse } from "next/server";

export async function GET() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const attendanceUrl = process.env.ATTENDANCE_URL;

  if (!webhookUrl || !attendanceUrl) {
    console.warn("SLACK_WEBHOOK_URL 또는 ATTENDANCE_URL이 설정되어 있지 않습니다.");
    return NextResponse.json(
      { ok: false, message: "환경변수가 없습니다." },
      { status: 500 }
    );
  }

  const payload = {
    text: "출석 체크 시간입니다.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*좋은 아침이에요* 👋\n아래 버튼을 눌러 출석을 완료해주세요.",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "출근체크 하기",
              emoji: true,
            },
            url: attendanceUrl,
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

    return NextResponse.json({ ok: true, message: "Slack으로 출석 메시지를 보냈습니다." });
  } catch (e) {
    console.error("Slack 출석 메시지 전송 실패:", e);
    return NextResponse.json(
      { ok: false, message: "Slack 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}