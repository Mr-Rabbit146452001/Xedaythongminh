import fitz

pdf_path = r"C:\Users\LE THI HAU\Downloads\aaa\04_SV_2026_VT2 (2).pdf"
doc = fitz.open(pdf_path)

print("=== CHECKING PRELIMINARY PAGES (1-8) ===")
for pno in range(8):
    txt = doc[pno].get_text()
    first_lines = "\n".join([line.strip() for line in txt.split("\n") if line.strip()][:5])
    print(f"--- Page {pno+1} ---")
    print(first_lines)
    if "VIẾT TẮT" in txt.upper() or "KÝ HIỆU" in txt.upper() or "ABBREVIATION" in txt.upper():
        print(f"!!! FOUND ABBREVIATION LIST ON PAGE {pno+1} !!!")
        print(txt)

print("\n=== EXTRACTING CHAPTER 1 (PAGES 8-12) ===")
for pno in range(7, 12):
    txt = doc[pno].get_text()
    print(f"\n==================== PAGE {pno+1} ====================")
    print(txt)
