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
    "0"
  )}:${String(minute).padStart(2, "0")}`;

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
  const { name, completedTasks, incompleteTasks, incompleteReason, todayComment } = body;

  if (!name) {
    return NextResponse.json(
      { message: "이름이 필요합니다." },
      { status: 400 }
    );
  }

  const koreaTime = getKoreaTime();

  // 서버 로그
  console.log("[CHECKOUT]", {
    name,
    time: koreaTime.formatted,
  });

  // ✅ Slack Webhook으로 전송
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (webhookUrl) {
    const textLines = [
      `👤 *${name}* 퇴근`,
      `🕒 시간: ${koreaTime.formatted}`,
      "",
    ];

    // 업무 일지 추가
    if (completedTasks) {
      textLines.push(`✅ *오늘 완료한 일*`);
      textLines.push(completedTasks);
      textLines.push("");
    }

    if (incompleteTasks) {
      textLines.push(`⚠️ *오늘 하지 못한 일*`);
      textLines.push(incompleteTasks);
      textLines.push("");
    }

    if (incompleteReason) {
      textLines.push(`📝 *하지 못한 이유*`);
      textLines.push(incompleteReason);
      textLines.push("");
    }

    if (todayComment) {
      textLines.push(`💬 *${todayComment}*`);
      textLines.push("");
    }

    textLines.push("🏠 수고하셨습니다!");

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
    message: "퇴근이 기록되었습니다.",
  });
}