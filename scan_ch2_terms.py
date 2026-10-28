import re

with open(r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\chapter2_full_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Find abbreviations: 2+ uppercase letters, or mixed alphanumeric like YOLO11n, HX711, VL53L0X, etc.
candidates = set(re.findall(r'\b[A-Z0-9]{2,}\b|\b[A-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\b', text))

# Filter out Vietnamese capitalized proper nouns if any, but keep technical terms
tech_terms = []
for c in sorted(candidates):
    # check occurrences and context
    count = len(re.findall(r'\b' + re.escape(c) + r'\b', text))
    tech_terms.append((c, count))

print("Total candidate terms:", len(tech_terms))
for term, count in tech_terms:
    print(f"{term}: {count}")
