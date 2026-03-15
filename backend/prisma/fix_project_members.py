import sqlite3

DB_PATH = "dev.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
INSERT INTO project_members (id, role, joinedAt, userId, projectId)
SELECT
    lower(hex(randomblob(12))),
    'CONTRIBUTOR',
    CAST(strftime('%s','now') AS INTEGER) * 1000,
    ta.userId,
    t.projectId
FROM task_assignees ta
JOIN tasks t ON t.id = ta.taskId
LEFT JOIN project_members pm
    ON pm.projectId = t.projectId
   AND pm.userId = ta.userId
WHERE pm.id IS NULL
GROUP BY ta.userId, t.projectId;
""")

print("Rows inserted:", cur.rowcount)

conn.commit()
conn.close()