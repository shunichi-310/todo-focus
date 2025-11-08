if (!localStorage.getItem("user_id")) {
  localStorage.setItem("user_id", crypto.randomUUID());
}
const USER_ID = localStorage.getItem("user_id");

// APIの接続先設定
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://todo-focus-backend.onrender.com" // Render本番用
    : "http://localhost:5001"; // ローカル開発用

// ToDo 一覧取得
export const getTodos = async () => {
  const res = await fetch(`${API_URL}/todos?user_id=${USER_ID}`);
  return res.json();
};

// ToDo 追加
export const addTodo = async (task) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, user_id: USER_ID }),
  });
  return res.json();
};

// ToDo 完了状態の切替
export const toggleTodo = async (id) => {
  const res = await fetch(`${API_URL}/todos/${id}/complete`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID }),
  });
  return res.json();
};

// ToDo 削除
export const deleteTodo = async (id) => {
  await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID }),
  });
};

// フォーカスセッション追加
export const addFocus = async () => {
  await fetch(`${API_URL}/focus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID }),
  });
};

// 統計データ取得
export const getStats = async () => {
  const res = await fetch(`${API_URL}/stats?user_id=${USER_ID}`);
  return res.json();
};
