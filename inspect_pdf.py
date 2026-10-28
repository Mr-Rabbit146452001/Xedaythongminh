import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")
toc = doc.get_toc()
print(f"TOC items: {len(toc)}")
for item in toc[:30]:
    print(item)

# Search for Chapter 1 in pages
print("\n--- Searching for Chuong 1 ---")
ch1_pages = []
for pno in range(len(doc)):
    text = doc[pno].get_text()
    if "CHƯƠNG 1" in text.upper() or "CHƯƠNG I" in text.upper():
        print(f"Page {pno+1}: found chapter 1 marker")
        ch1_pages.append(pno)
    if "CHƯƠNG 2" in text.upper() or "CHƯƠNG II" in text.upper():
        print(f"Page {pno+1}: found chapter 2 marker")

