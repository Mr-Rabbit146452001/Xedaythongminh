import json
from pathlib import Path
from PIL import Image

user_up = Path(r"C:\Users\LE THI HAU\.gemini\antigravity\brain\e26c93ce-f58f-4b76-bb0f-2b78cb3bf30c\.user_uploaded")
for p in user_up.glob("*"):
    try:
        im = Image.open(p)
        print(f"{p.name} | Size: {im.size} | Format: {im.format}")
    except Exception as e:
        print(f"{p.name} | Error: {e}")
