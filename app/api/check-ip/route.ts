import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1) 개발 환경에서는 일단 항상 허용
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({
      allowed: true,
      ip: "dev",
      message:
        "개발 모드입니다. 네트워크와 상관없이 출석 테스트가 가능해요.",
    });
  }

  // 2) 실제 운영 환경에서만 IP 체크
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const remoteAddr = req.headers.get("remote-addr") || "";
  
  let ip = forwarded.split(",")[0].trim();

  // 혹시 몰라서 Fallback 한 번 더
  if (!ip) {
    ip = realIp || remoteAddr || "unknown";
  }

  const allowedList = process.env.ALLOWED_IPS || "";
  const allowedIps = allowedList
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const allowed = allowedIps.includes(ip);

  // 디버깅 정보 추가
  console.log("IP Debug Info:", {
    forwarded,
    realIp,
    remoteAddr,
    detectedIp: ip,
    allowedList,
    allowedIps,
    allowed
  });

  return NextResponse.json({
    allowed,
    ip,
    message: allowed
      ? "회사 네트워크에서 접속한 것이 확인되었습니다."
      : "회사 네트워크가 아닌 것으로 확인되었습니다.",
    debug: {
      forwarded,
      realIp,
      remoteAddr,
      allowedIps,
      allowedList
    }
  });
}