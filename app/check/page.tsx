"use client";

import { useEffect, useState } from "react";

export default function CheckPage() {
  const [status, setStatus] = useState("loading"); // loading | allowed | denied | error
  const [message, setMessage] = useState("");
  const [attendStatus, setAttendStatus] = useState<null | "done" | "fail">(null);
  const [selectedName, setSelectedName] = useState<string>("김동규"); // 출석자 선택

  useEffect(() => {
    const checkIp = async () => {
      try {
        const res = await fetch("/api/check-ip");
        const data = await res.json();
        
        console.log("IP Check Response:", data);

        if (res.ok && data.allowed) {
          setStatus("allowed");
          setMessage("회사 네트워크가 확인되었습니다. 출석을 진행해주세요.");
        } else {
          setStatus("denied");
          setMessage(
            data.message || "회사 네트워크에서만 접속할 수 있습니다."
          );
        }
      } catch (e) {
        console.error("IP Check Error:", e);
        setStatus("error");
        setMessage("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    };

    checkIp();
  }, []);

  const handleAttend = async () => {
    try {
      if (!selectedName) {
        alert("이름을 선택해주세요.");
        return;
      }

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName }),
      });

      const data = await res.json();

      if (res.ok) {
        setAttendStatus("done");
        alert("출석 완료! ✨");
      } else {
        setAttendStatus("fail");
        alert(data.message || "출석에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setAttendStatus("fail");
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f4",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px 28px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>출석 체크</h1>

        {status === "loading" && <p>네트워크를 확인하고 있습니다...</p>}

        {status !== "loading" && (
          <p style={{ marginBottom: "16px" }}>{message}</p>
        )}

        {status === "allowed" && (
          <>
            {/* 이름 선택 드롭다운 */}
            <div style={{ marginBottom: "12px", textAlign: "left" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                출석자 선택
              </label>
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                }}
              >
                <option value="김동규">김동규</option>
                <option value="김하나">김하나</option>
              </select>
            </div>

            <button
              onClick={handleAttend}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "15px",
              }}
            >
              출석하기
            </button>
            {attendStatus === "done" && (
              <p style={{ marginTop: "12px", fontSize: "13px" }}>
                오늘 출석이 기록되었습니다 ✅
              </p>
            )}
          </>
        )}

        {status === "denied" && (
          <p style={{ color: "#cc0000", fontSize: "13px", marginTop: "8px" }}>
            회사 와이파이(내부 네트워크)에서 다시 접속해주세요.
          </p>
        )}

        {status === "error" && (
          <p style={{ color: "#cc0000", fontSize: "13px", marginTop: "8px" }}>
            문제가 발생했습니다. 관리자에게 문의해주세요.
          </p>
        )}
      </div>
    </div>
  );
}