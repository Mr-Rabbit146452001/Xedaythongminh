import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

# Chapter 4 is page 63 to 76 (indices 62 to 75)
ch4_text = ""
for pno in range(62, 76):
    txt = doc[pno].get_text()
    ch4_text += f"\n--- PDF PAGE {pno+1} ---\n" + txt

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter4_full_text.txt", "w", encoding="utf-8") as f:
    f.write(ch4_text)

print(f"Extracted Chapter 4. Total length: {len(ch4_text)} characters.")
