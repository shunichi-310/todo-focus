// src/api.js
// API接続設定（開発：localhost / 本番：Render）
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://todo-focus-backend.onrender.com" // Render用
    : "http://localhost:5001"; // ローカルでFlaskが動いているポート

export const getTodos = async () => {
  const res = await fetch(`${API_URL}/todos`);
  return res.json();
};

export const addTodo = async (task) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });
  return res.json();
};

export const toggleTodo = async (id) => {
  const res = await fetch(`${API_URL}/todos/${id}/complete`, {
    method: "PUT",
  });
  return res.json();
};

export const deleteTodo = async (id) => {
  await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
};

// 統計データ取得
export const getStats = async () => {
  const res = await fetch(`${API_URL}/stats`);
  return res.json();
};
