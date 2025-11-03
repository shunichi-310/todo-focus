const API_URL = "http://localhost:5001";

export async function getTodos() {
  const res = await fetch(`${API_URL}/todos`);
  return await res.json();
}

export async function addTodo(task) {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task }),
  });
  return await res.json();
}

export async function toggleTodo(id) {
  const res = await fetch(`${API_URL}/todos/${id}/complete`, { method: "PUT" });
  return await res.json();
}

export async function deleteTodo(id) {
  await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
}
