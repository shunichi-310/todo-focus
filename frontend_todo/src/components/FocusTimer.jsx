import React, { useState, useEffect } from "react";

const FocusTimer = () => {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (running && time > 0) {
      timer = setInterval(() => setTime((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running, time]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center bg-[#404550] rounded-2xl shadow-lg py-8 px-10">
      {/* タイトル */}
      <h2 className="text-yellow-400 font-bold text-2xl mb-2">
        Focus Timer
      </h2>

      {/* 時間表示 */}
      <h1 className="text-6xl font-extrabold text-yellow-300 mb-6">
        {formatTime(time)}
      </h1>

      {/* スタート・ストップボタン */}
      <button
        onClick={() => setRunning(!running)}
        className={`px-8 py-3 font-semibold rounded-xl shadow-md transition-all duration-300 ${
          running
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
};

export default FocusTimer;
