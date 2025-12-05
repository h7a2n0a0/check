import { NextResponse } from "next/server";

function getKoreaTime() {
  const now = new Date();

  // 1) 현재 시간을 UTC 기준으로 맞추고
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60_000;

  // 2) UTC + 9시간 = 한국 시간(KST)
  const kstDate = new Date(utcTime + 9 * 60 * 60_000);

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");
  const hour = kstDate.getHours(); // 0~23 (KST)
  const minute = kstDate.getMinutes();

  const formatted = `${year}-${month}-${day} ${String(hour).padStart(
    2,
  )}:${String(minute).padStart(2)}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    formatted,
  };
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(
      { message: "이름이 필요합니다." },
      { status: 400 }
    );
  }

  const koreaTime = getKoreaTime();
  
  // 요일 확인 (0: 일요일, 1: 월요일, 2: 화요일, ...)
  const dayOfWeek = new Date().getDay();
  const isMonday = dayOfWeek === 1;

  // 지각 기준: 월요일은 10:35, 화-금은 10:05 이후면 지각
  let isLate;
  if (isMonday) {
    isLate = koreaTime.hour > 10 || (koreaTime.hour === 10 && koreaTime.minute > 35);
  } else {
    isLate = koreaTime.hour > 10 || (koreaTime.hour === 10 && koreaTime.minute > 5);
  }

  // 서버 로그
  console.log("[ATTENDANCE]", {
    name,
    time: koreaTime.formatted,
    isLate,
  });

  // ✅ Slack Webhook으로 전송
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (webhookUrl) {
    const textLines = [
      `👤 *${name}* 출근`,
      `🕒 시간: ${koreaTime.formatted}`,
    ];

    if (isLate) {
      if (isMonday) {
        textLines.push("⚠️ 출근 시간을 지키지 못했습니다. (10:35 이후 출석)");
      } else {
        textLines.push("⚠️ 출근 시간을 지키지 못했습니다. (10:05 이후 출석)");
      }
    } else {
      textLines.push("✅ 정시에 출근했습니다.");
    }

    const payload = {
      text: textLines.join("\n"),
    };

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Slack Webhook 전송 실패:", e);
    }
  } else {
    console.warn("SLACK_WEBHOOK_URL이 설정되어 있지 않습니다.");
  }

  return NextResponse.json({
    ok: true,
    message: "출석이 기록되었습니다.",
    late: isLate,
  });
}