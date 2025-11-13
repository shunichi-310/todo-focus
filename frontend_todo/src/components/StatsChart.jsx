import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ★ ローカル日付を正しく文字列に変換する関数（タイムゾーンずれ対策）
const getLocalDateStr = (date = new Date()) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

export default function StatsChart({ stats }) {
  // 今日の日付（ローカル）
  const todayStr = getLocalDateStr();

  // 直近7日分のデータを生成
  const today = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));

    // ローカル日付文字列に変換
    const dateStr = getLocalDateStr(d);

    // APIのデータから一致する日を探す
    const found = stats?.find((s) => s.date === dateStr);

    return {
      date: dateStr,
      name:
        dateStr === todayStr
          ? "今日"
          : `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`,
      Completed: found ? found.completed : 0,
    };
  });

  // データがすべて0かを確認
  const allZero = days.every((d) => d.Completed === 0);

  return (
    <div className="bg-[#404550] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center overflow-hidden">
      {/* タイトル */}
      <h2 className="text-yellow-400 font-bold text-2xl mb-2">Completed</h2>

      {/* 空データのときでもグラフは残す */}
      {allZero && (
        <p className="text-gray-400 text-sm mb-2"></p>
      )}

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
              color: "#f3cd49",
            }}
            labelStyle={{ color: "#f3cd49" }}
          />
          <Bar
            dataKey="Completed"
            fill="#f3cd49"
            radius={[8, 8, 0, 0]}
            background={false}
            activeBar={{ fill: "#f3cd49" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
