import fitz
import re

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

# Scan all pages for section headers with "VIẾT TẮT"
for i in range(len(doc)):
    t = doc[i].get_text()
    if "VIẾT TẮT" in t.upper():
        print(f"Page {i+1} mentions 'viết tắt'")
