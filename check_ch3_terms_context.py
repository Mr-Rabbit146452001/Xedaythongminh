with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter3_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

terms_to_examine = [
    "ACID", "ACK", "ADC", "API", "RESTful", "AdamW", "AppViewModel", "BCM", "BGR",
    "CAM0", "CAM2", "CSI", "CSS", "CSV", "DMA", "DOUT", "DVDD", "DevOps",
    "EAN", "FPS", "FastAPI", "GM65", "GND", "GPIO", "HTTP", "HTTPS",
    "HX711", "I2C", "IC", "IoT", "IoU", "JSON", "KPI", "LazyColumn",
    "MJPG", "MVVM", "NCNN", "NMS", "OpenCV", "PIN", "PWA", "PostgreSQL",
    "QR", "VietQR", "RAM", "REST", "RGB", "ROI", "SCL", "SDA", "SKU",
    "SQL", "SQLite", "StateFlow", "ThingsBoard", "ToF", "UI", "UPSERT",
    "URL", "USB", "UUID", "UVC", "V4L2", "ViewModel", "XSHUT", "YOLO11n", "ZIP"
]

import re
print("=== CONTEXT OF TERMS IN CHAPTER 3 ===")
for t in terms_to_examine:
    matches = re.findall(r'([^.\n]*?' + re.escape(t) + r'[^.\n]*)', text, re.IGNORECASE)
    if matches:
        print(f"\n--- [{t}] ({len(matches)}) ---")
        print(matches[0].strip()[:140])
