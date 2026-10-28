import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

for item in doc.get_toc():
    if item[0] == 1:
        print(item)
