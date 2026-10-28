import shutil

src = r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.md"
destinations = [
    r"C:\Users\LE THI HAU\Downloads\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.md",
    r"C:\Users\LE THI HAU\Pictures\Screenshots\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.md",
    r"c:\Users\LE THI HAU\Downloads\cơ sơ dữ liệu-0\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.md"
]

for d in destinations:
    try:
        shutil.copy(src, d)
        print(f"Copied to {d}")
    except Exception as e:
        print(f"Error copying to {d}: {e}")
