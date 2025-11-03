from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Todo

app = Flask(__name__)
CORS(app)  # Reactからアクセスできるようにする

# --- データベース設定 ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# --- DB初期化 ---
with app.app_context():
    db.create_all()

# --- APIエンドポイント群（React用） ---

# 全タスク取得
@app.route('/todos', methods=['GET'])
def get_todos():
    tasks = Todo.query.order_by(Todo.date_created).all()
    todo_list = []
    for t in tasks:
        todo_list.append({
            "id": t.id,
            "task": t.task,
            "complete": t.complete
        })
    return jsonify(todo_list)


# タスク追加
@app.route('/todos', methods=['POST'])
def add_todo():
    data = request.get_json()
    task_content = data.get('task', '')
    new_task = Todo(task=task_content)
    db.session.add(new_task)
    db.session.commit()
    return jsonify({
        "id": new_task.id,
        "task": new_task.task,
        "complete": new_task.complete
    }), 201


# タスク削除
@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    task = Todo.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200


# 完了切り替え
@app.route('/todos/<int:id>/complete', methods=['PUT'])
def toggle_complete(id):
    task = Todo.query.get_or_404(id)
    task.complete = not task.complete
    db.session.commit()
    return jsonify({
        "id": task.id,
        "task": task.task,
        "complete": task.complete
    })


# --- メイン実行部（ポート5001に変更） ---
if __name__ == '__main__':
    app.run(debug=True, port=5001)
