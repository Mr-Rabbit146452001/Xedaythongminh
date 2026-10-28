import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

# Let's extract pages 8, 9, 10 (which are numbered page 7, 8, 9 in thesis footers, or PDF page 9, 10, 11)
ch1_text = ""
for pno in [8, 9, 10]:
    txt = doc[pno].get_text()
    ch1_text += f"\n--- PDF PAGE {pno+1} ---\n" + txt

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter1_full_text.txt", "w", encoding="utf-8") as f:
    f.write(ch1_text)

print("Saved chapter 1 text. Total length:", len(ch1_text))
print(ch1_text)
