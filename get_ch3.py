import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

# Chapter 3 is page 23 to 62 (indices 22 to 61)
ch3_text = ""
for pno in range(22, 62):
    txt = doc[pno].get_text()
    ch3_text += f"\n--- PDF PAGE {pno+1} ---\n" + txt

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter3_full_text.txt", "w", encoding="utf-8") as f:
    f.write(ch3_text)

print(f"Extracted Chapter 3. Total length: {len(ch3_text)} characters.")
