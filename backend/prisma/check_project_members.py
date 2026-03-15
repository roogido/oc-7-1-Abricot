import sqlite3

DB_PATH = "dev.db"

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

rows = cur.execute("""
SELECT
    p.name AS project_name,
    u.name AS assigned_user,
    u.email AS assigned_email,
    t.title AS task_title
FROM task_assignees ta
JOIN tasks t ON t.id = ta.taskId
JOIN projects p ON p.id = t.projectId
JOIN users u ON u.id = ta.userId
LEFT JOIN project_members pm
    ON pm.projectId = t.projectId
   AND pm.userId = ta.userId
WHERE pm.id IS NULL
ORDER BY p.name, u.name, t.title;
""").fetchall()

print("Remaining inconsistencies:", len(rows))
for row in rows:
    print(dict(row))

conn.close()