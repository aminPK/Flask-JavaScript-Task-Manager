from flask import Flask, jsonify, request
from flask_cors import CORS
from pathlib import Path
import json

# Flask Server erstellen
app = Flask(__name__)
CORS(app)

# Speicherort der JSON-Datei
BASE_DIR = Path(__file__).resolve().parent
TASKS_FILE = BASE_DIR / "tasks.json"


# Aufgaben laden
def load_tasks():
    if not TASKS_FILE.exists():
        return []

    try:
        with open(TASKS_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

            if isinstance(data, list):
                return data

            return []

    except json.JSONDecodeError:
        print("Error: tasks.json contains invalid JSON.")
        return []


# Aufgaben speichern
def save_tasks():
    with open(TASKS_FILE, "w", encoding="utf-8") as file:
        json.dump(tasks, file, indent=4, ensure_ascii=False)


# Aufgaben initialisieren
tasks = load_tasks()


# Alle Aufgaben abrufen
@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks), 200


# Neue Aufgabe hinzufügen
@app.route("/add", methods=["POST"])
def add_task():

    data = request.get_json(silent=True) or {}

    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Task text is required"}), 400

    new_task = {
        "id": max((task["id"] for task in tasks), default=999) + 1,
        "text": text,
        "done": False
    }

    tasks.append(new_task)
    save_tasks()

    return jsonify(new_task), 201


# Aufgabe als erledigt markieren
@app.route("/done/<int:id>", methods=["POST"])
def mark_done(id):

    for task in tasks:
        if task["id"] == id:

            task["done"] = not task["done"]

            save_tasks()

            return jsonify(task), 200

    return jsonify({"error": "Task not found"}), 404


# Aufgabe löschen
@app.route("/delete/<int:id>", methods=["POST"])
def delete_task(id):

    global tasks

    for task in tasks:
        if task["id"] == id:

            tasks = [
                task for task in tasks
                if task["id"] != id
            ]

            save_tasks()

            return jsonify({"status": "deleted"}), 200

    return jsonify({"error": "Task not found"}), 404


# Aufgabe bearbeiten
@app.route("/edit/<int:id>", methods=["POST"])
def edit_task(id):

    data = request.get_json(silent=True) or {}

    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Task text is required"}), 400

    for task in tasks:
        if task["id"] == id:

            task["text"] = text

            save_tasks()

            return jsonify(task), 200

    return jsonify({"error": "Task not found"}), 404


# Erledigte Aufgaben entfernen
@app.route("/clear-completed", methods=["POST"])
def clear_completed():

    global tasks

    tasks = [
        task for task in tasks
        if not task["done"]
    ]

    save_tasks()

    return jsonify({"status": "completed tasks cleared"}), 200


# Server starten
if __name__ == "__main__":
    app.run(debug=False)