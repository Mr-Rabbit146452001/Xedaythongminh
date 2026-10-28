import re

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter1_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Find words with 2 or more uppercase letters or mixed alphanumeric
words = re.findall(r'\b[A-Za-z0-9_]{2,}\b', text)
caps = set()
for w in words:
    # has uppercase letter and looks like acronym or technical code
    if any(c.isupper() for c in w):
        caps.add(w)

print("Detected capitalized/technical terms:")
for w in sorted(caps):
    print(w)
