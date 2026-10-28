import json
from pathlib import Path

transcript_path = Path(r"C:\Users\LE THI HAU\.gemini\antigravity\brain\e26c93ce-f58f-4b76-bb0f-2b78cb3bf30c\.system_generated\logs\transcript.jsonl")
if transcript_path.exists():
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    print(f"Step {data.get('step_index', i)} | USER: {data.get('content', '')[:120]}")
            except Exception as e:
                pass
