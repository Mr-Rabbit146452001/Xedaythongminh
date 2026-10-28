import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

toc = doc.get_toc()
ch4_items = []
for item in toc:
    lvl, title, pno = item
    if 63 <= pno <= 76:
        ch4_items.append(item)

for it in ch4_items:
    indent = "  " * (it[0] - 1)
    print(f"{indent}{it[1]} (Page {it[2]})")
