with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter2_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

terms_to_find = [
    "RPC", "RP2K", "SKU", "SKU-110K", "IncreACO", "NMS", "IoT", "AI", "Edge AI",
    "ONNX", "NCNN", "PTQ", "QAT", "INT8", "FP32",
    "CPU", "GPU", "RAM", "GB", "MB", "FPS", "FLOPs", "GFLOPs", "MAC",
    "RGB", "BGR", "CNN", "BatchNorm", "SiLU",
    "YOLO", "YOLO11", "YOLO11n", "YOLOv8n", "COCO",
    "C3k2", "SPPF", "C2PSA", "QKT", "DFL",
    "TaskAlignedAssigner", "BCEWithLogitsLoss", "CIoU", "IoU",
    "TP", "FP", "FN", "F1", "AP", "PR",
    "ADC", "Loadcell", "HX711", "DOUT", "SCK",
    "ToF", "VL53L0X", "VCSEL", "SPAD", "XSHUT", "I2C",
    "GM65", "UART", "USB", "BCM14", "BCM15"
]

print("=== CHECKING TERMS IN CHAPTER 2 ===")
found_terms = []
for t in terms_to_find:
    import re
    matches = re.findall(r'([^.\n]*?' + re.escape(t) + r'[^.\n]*)', text, re.IGNORECASE)
    if matches:
        found_terms.append(t)
        print(f"[{t}] ({len(matches)} occurrences): Sample: {matches[0].strip()[:100]}...")

print(f"\nFound {len(found_terms)}/{len(terms_to_find)} target terms in Chapter 2.")
