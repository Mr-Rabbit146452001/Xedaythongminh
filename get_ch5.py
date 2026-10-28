import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")
ch5_text = ""
for pno in range(76, len(doc)):
    txt = doc[pno].get_text()
    print(f"\n==================== PDF PAGE {pno+1} ====================")
    print(txt[:300])
    ch5_text += f"\n--- PDF PAGE {pno+1} ---\n" + txt

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter5_full_text.txt", "w", encoding="utf-8") as f:
    f.write(ch5_text)

print(f"\nSaved Chapter 5 text. Total length: {len(ch5_text)} characters.")
