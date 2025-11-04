from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

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
    """完了・未完了の切り替えに応じて Stat テーブルを更新（当日分のみカウント）"""
    task = Todo.query.get_or_404(id)
    previous_state = task.complete  # 変更前の状態を保持
    task.complete = not task.complete
    db.session.commit()

    today = datetime.now().strftime("%Y-%m-%d")

    # 今日の統計を取得または新規作成
    stat = Stat.query.filter_by(date=today).first()
    if not stat:
        stat = Stat(date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    # ✅ 「今日完了した回数」のみカウント
    if not previous_state and task.complete:
        # → 未完了 → 完了
        stat.completed += 1
    elif previous_state and not task.complete:
        # → 完了 → 未完了（今日の完了数を減らす）
        stat.completed = max(0, stat.completed - 1)

    db.session.commit()

    return jsonify({
        "id": task.id,
        "task": task.task,
        "complete": task.complete
    })


@app.route("/todos/<int:id>", methods=["DELETE"])
def delete_todo(id):
    """タスク削除"""
    task = Todo.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"result": True})


# ========================
# Focus Timer 関連
# ========================
@app.route("/focus", methods=["POST"])
def add_focus_session():
    """タイマー完了時に focus_sessions を +1"""
    today = datetime.now().strftime("%Y-%m-%d")
    stat = Stat.query.filter_by(date=today).first()

    if not stat:
        stat = Stat(date=today, completed=0, focus_sessions=0)
        db.session.add(stat)

    stat.focus_sessions += 1
    db.session.commit()
    return jsonify({"message": "Focus session added"})


# ========================
# 統計データ取得
# ========================
@app.route("/stats", methods=["GET"])
def get_stats():
    """グラフ用統計データを過去7日分のみ日付昇順で返す"""
    stats = Stat.query.order_by(Stat.date.desc()).limit(7).all()
    return jsonify([
        {"date": s.date, "completed": s.completed, "focus": s.focus_sessions}
        for s in stats
    ][::-1])  # 日付昇順に反転


# ========================
# DB初期化
# ========================
with app.app_context():
    db.create_all()


# ========================
# メイン起動
# ========================
if __name__ == "__main__":
    app.run(debug=True, port=5001)
