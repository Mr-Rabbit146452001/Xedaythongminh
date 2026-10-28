import os
from pathlib import Path

search_dirs = [
    Path(r"C:\Users\LE THI HAU\Pictures"),
    Path(r"C:\Users\LE THI HAU\Downloads"),
    Path(r"C:\Users\LE THI HAU\Desktop"),
    Path(r"C:\Users\LE THI HAU\Documents"),
    Path(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch"),
    Path(r"C:\Users\LE THI HAU\.gemini\antigravity\brain")
]

keywords = ["erd", "database", "so_do", "sodo", "quanhe", "thucthe", "bang", "khoa"]

for sdir in search_dirs:
    if not sdir.exists():
        continue
    for root, dirs, files in os.walk(sdir):
        for f in files:
            name_lower = f.lower()
            if any(k in name_lower for k in keywords) and any(ext in name_lower for ext in [".png", ".jpg", ".jpeg", ".svg", ".html", ".py", ".pdf"]):
                print(os.path.join(root, f))
