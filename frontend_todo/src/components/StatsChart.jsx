import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatsChart({ stats }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm">
        データがまだありません
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  // ✅ 直近7日分を生成（欠けてる日は0）
  const today = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const found = stats.find((s) => s.date === dateStr);
    return {
      date: dateStr,
      name:
        dateStr === todayStr
          ? "今日"
          : `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`,
      Completed: found ? found.completed : 0,
    };
  });

  return (
    <div className="bg-[#404550] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center overflow-hidden">
      {/* ✅ タイトル */}
      <h2 className="text-yellow-400 font-bold text-2xl mb-2">
        Completed
      </h2>

      <ResponsiveContainer
        width="95%"
        height={250}
        style={{
          backgroundColor: "transparent",
          overflow: "visible",
        }}
      >
        <BarChart
          data={days}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          style={{ backgroundColor: "transparent" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#555962" />
          <XAxis dataKey="name" stroke="#d1d5db" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#404550",
              border: "1px solid #555962",
              borderRadius: "8px",
              color: "#facc15",
            }}
            labelStyle={{ color: "#facc15" }}
          />
          <Bar
            dataKey="Completed"
            fill="#fde047"
            radius={[8, 8, 0, 0]}
            background={false}
            activeBar={{ fill: "#eab308" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
