import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

# Chapter 2 is from page index 11 (PDF page 12) to page index 21 (PDF page 22)
ch2_text = ""
for pno in range(11, 22):
    txt = doc[pno].get_text()
    ch2_text += f"\n--- PDF PAGE {pno+1} (Thesis page {doc[pno].get_text().splitlines()[-1] if doc[pno].get_text().splitlines() else ''}) ---\n" + txt

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter2_full_text.txt", "w", encoding="utf-8") as f:
    f.write(ch2_text)

print(f"Extracted Chapter 2. Total length: {len(ch2_text)} characters.")
