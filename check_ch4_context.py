with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter4_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

terms_to_examine = [
    "A72", "ARM", "SoC", "BCM2711", "LPDDR4", "DDR4", "NVMe", "SSD", "GHz", "KB", "MB", "GB",
    "IEEE", "802.11ac", "Wi-Fi", "MAE", "RToF", "P50", "P90", "P95", "P99", "SLA",
    "RenderThread", "VSync", "LazyColumn", "LazyListState", "ProcessTimeMiddleware",
    "SHA256", "TC", "UNIQUE", "ASGI", "FastAPI", "PostgreSQL", "SQLite", "EAN-13",
    "GM65", "HX711", "VL53L0X", "ToF", "ADC", "DMA", "YOLO11n", "ROI", "ACK", "ADD", "REMOVE", "ENTER", "CLEAR"
]

import re
print("=== CONTEXT OF TERMS IN CHAPTER 4 ===")
for t in terms_to_examine:
    matches = re.findall(r'([^.\n]*?' + re.escape(t) + r'[^.\n]*)', text, re.IGNORECASE)
    if matches:
        print(f"\n--- [{t}] ({len(matches)}) ---")
        print(matches[0].strip()[:140])
