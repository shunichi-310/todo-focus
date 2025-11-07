import React, { useEffect, useState } from "react";
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  getStats,
} from "./api";
import FocusTimer from "./components/FocusTimer";
import StatsChart from "./components/StatsChart";
import "./index.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [stats, setStats] = useState([]);

  // 初期読み込み（ToDoと統計）
  useEffect(() => {
    getTodos().then(setTodos);
    getStats().then(setStats);
  }, []);

  // ToDo追加
  const handleAdd = async () => {
    if (!task.trim()) return;
    const newTodo = await addTodo(task);
    setTodos([...todos, newTodo]);
    setTask("");
  };

  // 完了トグル
  const handleToggle = async (id) => {
    const updated = await toggleTodo(id);
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
    updateStats();
  };

  // 削除
  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
    updateStats();
  };

  // 統計更新
  const updateStats = () => {
    getStats().then(setStats);
  };

  // タイマー完了時の統計更新
  const handleFocusFinish = () => {
    updateStats();
  };

  // 進捗率
  const total = todos.length;
  const done = todos.filter((t) => t.complete).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-colors duration-700 py-10 px-4
      bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 text-gray-800"
    >
      {/* タイトル */}
      <h1 className="text-6xl font-black text-blue-600 mb-2">ToDo Focus</h1>

      {/* 進捗バー */}
      <div className="w-full max-w-md mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold">
            今日の達成率: {progress}% ({done}/{total})
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full transition-all duration-500 bg-blue-600"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* タスク入力 */}
      <div className="flex w-full max-w-md shadow-sm">
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="flex-grow px-4 py-3 rounded-l-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:shadow-[inset_0_0_8px_2px_rgba(99,102,241,0.6)] transition-all duration-300"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-3 font-semibold rounded-r-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          追加
        </button>
      </div>

      {/* タスク一覧 */}
      <ul className="w-full max-w-md space-y-2 my-5">
        {todos.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-xl shadow p-4 bg-white hover:shadow-md transition"
          >
            <span
              onClick={() => handleToggle(t.id)}
              className={`flex-1 cursor-pointer text-lg transition ${
                t.complete
                  ? "line-through text-gray-400"
                  : "text-gray-800 hover:text-indigo-600"
              }`}
            >
              {t.task}
            </span>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-sm font-semibold text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {/* Focus Timer */}
      <div className="flex justify-center w-full mb-6">
        <div className="w-full max-w-md">
          <FocusTimer defaultMinutes={25} onFinish={handleFocusFinish} />
        </div>
      </div>

      {/* グラフ */}
      <div className="w-full flex justify-center overflow-hidden">
        <div className="w-full max-w-md">
          <StatsChart stats={stats} />
        </div>
      </div>
    </div>
  );
}

export default App;
