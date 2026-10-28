import win32com.client as win32

word = win32.Dispatch('Word.Application')
word.Visible = False
try:
    doc = word.Documents.Open(r'C:\Users\LE THI HAU\Downloads\BaoCao_Backend_HeThong_Chuong3_4.docx')
    pages = doc.ComputeStatistics(2)
    print(f'TOTAL_PAGES: {pages}')
    doc.Close(False)
finally:
    word.Quit()
