with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter5_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Pages 77 to 79
p77_79 = text.split("==================== PDF PAGE 80 ====================")[0]
print(p77_79)
