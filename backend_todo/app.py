from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# データベース設定
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# モデル定義
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    task = db.Column(db.String(200), nullable=False)
    complete = db.Column(db.Boolean, default=False)

class Stat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20))
    completed = db.Column(db.Integer, default=0)
    focus_sessions = db.Column(db.Integer, default=0)

# ルート
@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "Backend is running!"})


# ---------------------------
# ToDo API
# ---------------------------

# ToDo取得
@app.route("/todos", methods=["GET"])
def get_todos():
    user_id = request.args.get("user_id")
    todos = Todo.query.filter_by(user_id=user_id).all()
    return jsonify([
        {"id": t.id, "task": t.task, "complete": t.complete}
        for t in todos
    ])

# ToDo追加
@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    task = Todo(task=data["task"], user_id=data["user_id"])
    db.session.add(task)
    db.session.commit()
    return jsonify({"id": task.id, "task": task.task, "complete": task.complete})

# 完了状態切替
@app.route("/todos/<int:id>/complete", methods=["PUT"])
def toggle_complete(id):
    data = request.get_json()
    user_id = data.get("user_id")

    task = Todo.query.get_or_404(id)
    if task.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    previous_state = task.complete
    task.complete = not task.complete
    db.session.commit()

    today = datetime.now().strftime("%Y-%m-%d")
    stat = Stat.query.filter_by(user_id=user_id, date=today).first()
    if not stat:
        stat = Stat(user_id=user_id, date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    if not previous_state and task.complete:
        stat.completed += 1
    elif previous_state and not task.complete:
        stat.completed = max(0, stat.completed - 1)

    db.session.commit()
    return jsonify({"id": task.id, "task": task.task, "complete": task.complete})

# ToDo削除
@app.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    data = request.get_json()
    user_id = data.get("user_id")

    task = Todo.query.get_or_404(id)
    if task.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({"result": True})


# ---------------------------
# フォーカスセッション
# ---------------------------

@app.route("/focus", methods=["POST"])
def add_focus_session():
    data = request.get_json()
    user_id = data.get("user_id")
    today = datetime.now().strftime("%Y-%m-%d")

    stat = Stat.query.filter_by(user_id=user_id, date=today).first()
    if not stat:
        stat = Stat(user_id=user_id, date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    stat.focus_sessions += 1
    db.session.commit()
    return jsonify({"message": "Focus session added"})


# ---------------------------
# 統計取得
# ---------------------------

@app.route("/stats", methods=["GET"])
def get_stats():
    user_id = request.args.get("user_id")
    stats = Stat.query.filter_by(user_id=user_id).order_by(Stat.date.desc()).limit(7).all()
    return jsonify([
        {"date": s.date, "completed": s.completed, "focus": s.focus_sessions}
        for s in stats
    ][::-1])


# ---------------------------
# ★ 開発用：任意の日付の Stat を追加する API（方法A）
# ---------------------------

@app.route("/stats/add", methods=["POST"])
def add_stat_manual():
    data = request.get_json()

    if "user_id" not in data or "date" not in data:
        return jsonify({"error": "user_id and date are required"}), 400

    stat = Stat(
        user_id=data["user_id"],
        date=data["date"],
        completed=data.get("completed", 0),
        focus_sessions=data.get("focus", 0),
    )

    db.session.add(stat)
    db.session.commit()

    return jsonify({"message": "Stat added", "data": data})


# DB初期化
with app.app_context():
    db.create_all()

# メイン
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
