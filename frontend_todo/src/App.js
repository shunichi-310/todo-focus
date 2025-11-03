import React, { useEffect, useState } from "react";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "./api";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // 初回レンダー時にFlaskからタスク一覧を取得
  useEffect(() => {
    getTodos().then(setTodos);
  }, []);

  const handleAdd = async () => {
    if (!task.trim()) return;
    const newTodo = await addTodo(task);
    setTodos([...todos, newTodo]);
    setTask("");
  };

  const handleToggle = async (id) => {
    const updated = await toggleTodo(id);
    setTodos(todos.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Todo List (Flask + React)</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="新しいタスクを入力"
        />
        <button onClick={handleAdd} style={{ marginLeft: "0.5rem" }}>
          追加
        </button>
      </div>

      <ul>
        {todos.map((t) => (
          <li key={t.id} style={{ marginBottom: "0.5rem" }}>
            <span
              onClick={() => handleToggle(t.id)}
              style={{
                textDecoration: t.complete ? "line-through" : "none",
                cursor: "pointer",
                marginRight: "1rem",
              }}
            >
              {t.task}
            </span>
            <button onClick={() => handleDelete(t.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
