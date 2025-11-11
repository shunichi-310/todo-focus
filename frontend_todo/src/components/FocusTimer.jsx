import React, { useState, useEffect, useRef } from "react";

const FocusTimer = () => {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const DELAY = 1000;

  const [time, setTime] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pipReady, setPipReady] = useState(false);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // 通知許可
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // 音再生
  const playSound = (fileName) => {
    const audio = new Audio(`/${fileName}`);
    audio.volume = 0.8;
    audio.play().catch((e) => console.warn("音が再生できません:", e));
  };

  // タイマー
  useEffect(() => {
    let timer;
    if (running && time > 0) {
      timer = setInterval(() => setTime((t) => t - 1), 1000);
    } else if (running && time === 0) {
      setTimeout(() => {
        const nextIsBreak = !isBreak;
        setIsBreak(nextIsBreak);
        setTime(nextIsBreak ? BREAK_TIME : WORK_TIME);
        playSound(nextIsBreak ? "1.mp3" : "2.mp3");

        if ("Notification" in window && Notification.permission === "granted") {
          const title = nextIsBreak ? "Break Time!" : "Back to Focus!";
          const body = nextIsBreak
            ? "お疲れ様！5分休憩しよう!"
            : "休憩終わり！作業に戻ろう!";
          const notification = new Notification(title, {
            body,
            requireInteraction: true,
          });
          notification.onclick = () => window.focus();
        }
      }, DELAY);
    }
    return () => clearInterval(timer);
  }, [running, time, isBreak]);

  // フォーマット
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Canvasに描画
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = isBreak ? "#41454f" : "#3565e3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f3cd49";
    ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatTime(time), canvas.width / 2, canvas.height / 2);
  }, [time, isBreak]);

  // 初期化（1回だけストリーム生成）
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!pipReady) {
      const stream = canvas.captureStream(30);
      video.srcObject = stream;

      // 再生準備完了後に PiP を開けるようにする
      video.play().then(() => setPipReady(true)).catch((e) => {
        console.warn("Video play error:", e);
      });
    }
  }, [pipReady]);

  // PiP起動
  const handlePiP = async () => {
    const video = videoRef.current;
    try {
      // 既にPiP中なら閉じる
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }
      // 準備完了後にPiP起動
      if (!pipReady) {
        await video.play(); // 再生要求を待つ
        setPipReady(true);
      }
      await video.requestPictureInPicture();
    } catch (err) {
      console.error("PiPエラー:", err);
    }
  };

  // Start / Stop
  const handleStartStop = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    setRunning(!running);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center bg-[#404550] rounded-2xl shadow-lg py-8 px-10">
      <h2 className="text-yellow-400 font-bold text-2xl mb-2">
        {isBreak ? "Break Time" : "Focus Timer"}
      </h2>

      <h1 className="text-6xl font-extrabold text-yellow-400 mb-6">
        {formatTime(time)}
      </h1>

      <div className="flex gap-4">
        <button
          onClick={handlePiP}
          className="px-8 py-3 bg-yellow-400 hover:bg-yellow-400 text-black font-semibold rounded-xl shadow-md"
        >
          最小表示
        </button>

        <button
          onClick={handleStartStop}
          className={`px-8 py-3 font-semibold rounded-xl shadow-md transition-all duration-300 ${
            running
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {running ? "Stop" : "Start"}
        </button>
      </div>

      {/* hidden elements */}
      <canvas
        ref={canvasRef}
        width="400"
        height="200"
        style={{ display: "none" }}
      />
      <video ref={videoRef} autoPlay muted style={{ display: "none" }} />
    </div>
  );
};

export default FocusTimer;
