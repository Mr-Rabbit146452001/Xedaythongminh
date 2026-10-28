import win32com.client as win32

word = win32.Dispatch('Word.Application')
word.Visible = False
try:
    doc = word.Documents.Open(r'C:\Users\LE THI HAU\Downloads\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.docx')
    pages = doc.ComputeStatistics(2)
    print(f'ABBREVIATIONS_DOCX_TOTAL_PAGES: {pages}')
    doc.Close(False)
finally:
    word.Quit()
