import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

toc = doc.get_toc()
ch3_items = []
for item in toc:
    lvl, title, pno = item
    if 23 <= pno <= 62:
        ch3_items.append(item)

for it in ch3_items:
    indent = "  " * (it[0] - 1)
    print(f"{indent}{it[1]} (Page {it[2]})")
