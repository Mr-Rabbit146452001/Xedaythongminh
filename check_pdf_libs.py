import sys

pdf_modules = ['pypdf', 'fitz', 'pdfplumber', 'pypdf2']
for mod in pdf_modules:
    try:
        __import__(mod)
        print(f"{mod}: available")
    except ImportError:
        print(f"{mod}: NOT available")
