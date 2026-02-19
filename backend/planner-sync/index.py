import json
import os
import psycopg2

def handler(event, context):
    """Синхронизация данных планера — сохранение и загрузка событий"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        cur.execute("SELECT events, updated_at FROM planner_data WHERE id = 1")
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'events': row[0], 'updated_at': str(row[1])})}
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'events': {}, 'updated_at': None})}

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        events = body.get('events', {})
        cur.execute(
            "INSERT INTO planner_data (id, events, updated_at) VALUES (1, %s::jsonb, NOW()) "
            "ON CONFLICT (id) DO UPDATE SET events = %s::jsonb, updated_at = NOW() "
            "RETURNING updated_at",
            (json.dumps(events), json.dumps(events))
        )
        updated_at = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'updated_at': str(updated_at)})}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
