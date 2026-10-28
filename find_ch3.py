import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

toc = doc.get_toc()
ch3_start = None
ch4_start = None

for item in toc:
    lvl, title, pno = item
    if "THIẾT KẾ" in title.upper() and lvl == 1:
        ch3_start = pno
        print("Chapter 3 start:", item)
    if "KẾT QUẢ" in title.upper() and lvl == 1:
        ch4_start = pno
        print("Chapter 4 start:", item)

print(f"Chapter 3: from PDF page {ch3_start} to {ch4_start - 1}")
