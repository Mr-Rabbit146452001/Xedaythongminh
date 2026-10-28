import re

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter4_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Pattern for abbreviations: 2+ uppercase letters, or mixed like YOLO11n, HX711, VL53L0X, Jetpack Compose, etc.
candidates = set(re.findall(r'\b[A-Z0-9]{2,}\b|\b[A-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\b', text))

clean_candidates = set()
for c in candidates:
    if c.isdigit():
        continue
    if c in ["PAGE", "PDF", "ĐÁNH", "GIÁ", "THỰC", "NGHIỆM", "HỆ", "THỐNG", "CHƯƠNG", "BẢNG", "HÌNH", "KẾT", "QUẢ"]:
        continue
    clean_candidates.add(c)

print(f"Total candidate terms in Chapter 4: {len(clean_candidates)}")

results = []
for term in sorted(clean_candidates):
    cnt = len(re.findall(r'\b' + re.escape(term) + r'\b', text))
    if cnt > 0:
        results.append((term, cnt))

for term, cnt in results:
    print(f"{term} ({cnt})")
