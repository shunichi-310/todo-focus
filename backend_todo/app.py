from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # ✅ CORS明示許可

# ========================
# データベース設定
# ========================
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///todos.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ========================
# モデル定義
# ========================
class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    complete = db.Column(db.Boolean, default=False)


class Stat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), unique=True)
    completed = db.Column(db.Integer, default=0)
    focus_sessions = db.Column(db.Integer, default=0)


# ========================
# Todo関連エンドポイント
# ========================
@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "Backend is running!"})


@app.route("/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    return jsonify([
        {"id": t.id, "task": t.task, "complete": t.complete}
        for t in todos
    ])


@app.route("/todos", methods=["POST"])
def add_todo():
    data = request.get_json()
    task = Todo(task=data["task"])
    db.session.add(task)
    db.session.commit()
    return jsonify({"id": task.id, "task": task.task, "complete": task.complete})


@app.route("/todos/<int:id>/complete", methods=["PUT"])
def toggle_complete(id):
    task = Todo.query.get_or_404(id)
    previous_state = task.complete
    task.complete = not task.complete
    db.session.commit()

    today = datetime.now().strftime("%Y-%m-%d")
    stat = Stat.query.filter_by(date=today).first()
    if not stat:
        stat = Stat(date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    if not previous_state and task.complete:
        stat.completed += 1
    elif previous_state and not task.complete:
        stat.completed = max(0, stat.completed - 1)

    db.session.commit()
    return jsonify({
        "id": task.id,
        "task": task.task,
        "complete": task.complete
    })


@app.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    task = Todo.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"result": True})


@app.route("/focus", methods=["POST"])
def add_focus_session():
    today = datetime.now().strftime("%Y-%m-%d")
    stat = Stat.query.filter_by(date=today).first()

    if not stat:
        stat = Stat(date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    stat.focus_sessions += 1
    db.session.commit()
    return jsonify({"message": "Focus session added"})


@app.route("/stats", methods=["GET"])
def get_stats():
    stats = Stat.query.order_by(Stat.date.desc()).limit(7).all()
    return jsonify([
        {"date": s.date, "completed": s.completed, "focus": s.focus_sessions}
        for s in stats
    ][::-1])


# ========================
# DB初期化
# ========================
with app.app_context():
    db.create_all()


# ========================
# メイン起動部分（←これがなかった！）
# ========================
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
