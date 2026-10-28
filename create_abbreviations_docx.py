# -*- coding: utf-8 -*-
"""
Script to create the standardized Word document for Abbreviations (Danh mục từ viết tắt)
for the Graduation Thesis: "Mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ"
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

# Data dictionary structured by 6 specialized academic groups
GROUPS_DATA = [
    {
        "group_name": "NHÓM 1: TRÍ TUỆ NHÂN TẠO, THỊ GIÁC MÁY TÍNH & HỌC SÂU (AI, COMPUTER VISION & DEEP LEARNING)",
        "description": "Các thuật ngữ, mô hình học máy, kiến trúc mạng nơ-ron, hàm mất mát và chỉ số đánh giá độ chính xác trong phân hệ nhận diện sản phẩm.",
        "terms": [
            ("AI", "Artificial Intelligence", "Trí tuệ nhân tạo: lĩnh vực khoa học máy tính mô phỏng trí thông minh con người, ứng dụng trong tự động nhận diện hàng hóa.", "Chương 1, 2, 3, 4, 5"),
            ("AIoT", "Artificial Intelligence of Things", "Trí tuệ nhân tạo kết hợp mạng lưới vạn vật kết nối Internet: kiến trúc kết hợp thuật toán AI tại biên với hệ sinh thái IoT.", "Chương 5"),
            ("Vision AI", "Computer Vision Artificial Intelligence", "Trí tuệ nhân tạo thị giác máy tính: công nghệ trích xuất đặc trưng và phân loại đối tượng từ dữ liệu hình ảnh camera.", "Chương 1, 3, 5"),
            ("Edge AI", "Edge Artificial Intelligence", "Trí tuệ nhân tạo tại biên: kỹ thuật triển khai và thực thi suy luận mô hình học sâu trực tiếp trên vi xử lý nhúng (Raspberry Pi 4).", "Chương 2, 3, 5"),
            ("CNN", "Convolutional Neural Network", "Mạng nơ-ron tích chập: kiến trúc học sâu chuyên dụng cho xử lý và trích xuất đặc trưng không gian từ dữ liệu ma trận ảnh.", "Chương 2"),
            ("YOLO", "You Only Look Once", "Họ thuật toán phát hiện vật thể thời gian thực đơn pha (single-stage), dự đoán đồng thời vị trí khung bao và xác suất lớp đối tượng.", "Chương 1, 2, 3"),
            ("YOLO11 / YOLO11n", "YOLO Version 11 (Nano variant)", "Phiên bản thế hệ 11 của YOLO; biến thể nano (n) có số lượng tham số nhỏ nhất (2,6M tham số), tối ưu riêng cho phần cứng nhúng.", "Chương 1, 2, 3, 4, 5"),
            ("YOLOv8n", "YOLO Version 8 (Nano variant)", "Phiên bản nano tiền nhiệm của YOLO11, được sử dụng trong Chương 2 làm cơ sở đối chuẩn (benchmark) hiệu năng.", "Chương 2"),
            ("COCO", "Common Objects in Context", "Tập dữ liệu chuẩn học máy quốc tế gồm 80 lớp vật thể, được sử dụng để benchmark độ chính xác chuẩn cho các mô hình phát hiện vật thể.", "Chương 2"),
            ("C3k2", "Cross Stage Partial with Kernel 2", "Khối trích xuất đặc trưng mới trong YOLO11 phát triển từ CSPNet, tối ưu hóa đường truyền gradient và giảm tải tính toán.", "Chương 2"),
            ("SPPF", "Spatial Pyramid Pooling - Fast", "Khối gộp kim tự tháp không gian tốc độ cao, hỗ trợ trích xuất đặc trưng đa tỉ lệ mà không làm tăng độ trễ suy luận.", "Chương 2"),
            ("C2PSA", "CSP with Pointwise Spatial Attention", "Khối chú ý không gian điểm tăng cường trong YOLO11, tăng cường trọng số cho các vùng ảnh mang đặc trưng sản phẩm then chốt.", "Chương 2"),
            ("QK^T", "Query - Key Transpose", "Phép nhân ma trận giữa vectơ truy vấn (Query) và chuyển vị khóa (Key) trong cơ chế tự chú ý (Self-Attention).", "Chương 2"),
            ("DFL", "Distribution Focal Loss", "Hàm mất mát hồi quy phân bố: mô hình hóa vị trí biên khung bao thành phân bố xác suất rời rạc nhằm tăng độ chính xác định vị.", "Chương 2"),
            ("TaskAlignedAssigner", "Task-Aligned Sample Assigner", "Thuật toán gán nhãn mẫu mục tiêu trong huấn luyện YOLO, kết hợp hài hòa giữa điểm tin cậy phân loại và chất lượng định vị IoU.", "Chương 2"),
            ("BCEWithLogitsLoss", "Binary Cross-Entropy with Logits Loss", "Hàm mất mát entropy chéo nhị phân tích hợp sẵn hàm kích hoạt Sigmoid, dùng để tính tổn thất phân loại nhãn sản phẩm.", "Chương 2"),
            ("IoU", "Intersection over Union", "Tỷ số diện tích phần giao trên diện tích phần hợp giữa khung bao dự đoán và khung bao nhãn thực tế (Ground Truth).", "Chương 2, 3"),
            ("CIoU", "Complete Intersection over Union", "Hàm mất mát và chỉ số IoU toàn diện, đo lường đồng thời độ trùng lặp diện tích, khoảng cách tâm và sai lệch tỷ lệ khung hình.", "Chương 2"),
            ("NMS", "Non-Maximum Suppression", "Thuật toán triệt tiêu phi cực đại: loại bỏ các khung bao trùng lặp dự đoán cùng một sản phẩm, chỉ giữ lại khung có điểm số cao nhất.", "Chương 2, 3"),
            ("TP", "True Positive", "Dương tính thật: trường hợp mô hình phát hiện đúng sự hiện diện và phân loại đúng nhãn sản phẩm có trong giỏ.", "Chương 2"),
            ("FP", "False Positive", "Dương tính giả: trường hợp mô hình nhận diện nhầm sản phẩm không có hoặc định vị sai vùng không gian.", "Chương 2"),
            ("FN", "False Negative", "Âm tính giả: trường hợp sản phẩm có trong giỏ hàng nhưng mô hình bỏ sót không nhận diện được.", "Chương 2"),
            ("P (Precision)", "Precision", "Độ chính xác: tỷ lệ số dự đoán đúng trên tổng số lần mô hình đưa ra dự đoán (P = TP / (TP + FP)).", "Chương 2"),
            ("R (Recall)", "Recall", "Độ nhạy / Độ bao phủ: tỷ lệ số sản phẩm nhận diện được trên tổng số sản phẩm thực tế có mặt (R = TP / (TP + FN)).", "Chương 2"),
            ("F1 / F1-Score", "F1-Score", "Điểm F1: trung bình điều hòa giữa Precision và Recall (F1 = 2 * (P * R) / (P + R)), đánh giá chất lượng toàn diện của mô hình AI.", "Chương 2"),
            ("AP", "Average Precision", "Độ chính xác trung bình cho từng lớp sản phẩm cụ thể, tính bằng diện tích dưới đường cong Precision-Recall.", "Chương 2"),
            ("mAP", "mean Average Precision", "Độ chính xác trung bình toàn diện trên tất cả các lớp sản phẩm (ví dụ mAP@0.5 hoặc mAP@0.5:0.95).", "Chương 2"),
            ("PR Curve", "Precision-Recall Curve", "Đường cong biểu diễn mối quan hệ đánh đổi giữa độ chính xác (Precision) và độ nhạy (Recall) tại các ngưỡng tin cậy khác nhau.", "Chương 2"),
            ("MOT", "Multi-Object Tracking", "Kỹ thuật theo dõi đa đối tượng: thuật toán bám vết và duy trì định danh quỹ đạo di chuyển của nhiều sản phẩm cùng lúc.", "Chương 5"),
            ("ByteTrack", "ByteTrack Algorithm", "Thuật toán bám vết đối tượng đa luồng hiệu năng cao dựa trên việc liên kết cả các khung bao có điểm tin cậy thấp.", "Chương 5"),
            ("DeepSORT", "Deep Simple Online and Realtime Tracking", "Thuật toán theo dõi đối tượng thời gian thực kết hợp bộ lọc Kalman và mạng trích xuất đặc trưng ngoại hình sâu.", "Chương 5"),
            ("ONNX", "Open Neural Network Exchange", "Định dạng tệp mở trung gian cho phép chuyển giao mô hình học sâu giữa PyTorch và các môi trường thực thi nhúng.", "Chương 2"),
            ("NCNN", "Tencent NCNN Framework", "Thư viện thực thi suy luận mạng nơ-ron mã nguồn mở siêu nhẹ, tối ưu riêng cho kiến trúc CPU ARM trên thiết bị di động và nhúng.", "Chương 2, 3"),
            ("PTQ", "Post-Training Quantization", "Lượng tử hóa sau huấn luyện: kỹ thuật nén mô hình chuyển đổi trọng số từ số thực FP32 sang số nguyên INT8 mà không cần huấn luyện lại.", "Chương 2"),
            ("QAT", "Quantization-Aware Training", "Huấn luyện có nhận thức lượng tử hóa: mô phỏng lỗi làm tròn lượng tử hóa ngay trong quá trình train để giữ vững độ chính xác.", "Chương 2"),
            ("FP32", "32-bit Floating Point", "Định dạng số thực dấu phẩy động 32-bit (độ chính xác đơn), định dạng chuẩn trong huấn luyện mô hình học sâu.", "Chương 2"),
            ("FP16", "16-bit Floating Point", "Định dạng số thực dấu phẩy động 16-bit (nửa độ chính xác), giảm 50% dung lượng bộ nhớ so với FP32.", "Chương 2"),
            ("INT8", "8-bit Integer", "Định dạng số nguyên 8-bit, dùng trong lượng tử hóa giúp tiết kiệm 4 lần bộ nhớ RAM và tăng tốc tính toán trên phần cứng biên.", "Chương 2"),
            ("FLOPs", "Floating Point Operations", "Số phép tính toán số thực dấu phẩy động, phản ánh độ phức tạp thuật toán và chi phí tính toán của mô hình nơ-ron.", "Chương 2"),
            ("GFLOPs", "Giga Floating Point Operations", "Một tỷ phép tính toán số thực dấu phẩy động (mô hình YOLO11n tiêu tốn xấp xỉ 8,7 GFLOPs).", "Chương 2"),
            ("MAC", "Multiply-Accumulate Operation", "Phép tính nhân - cộng tích lũy (A = A + B * C), đơn vị thao tác vi xử lý cơ bản nhất cấu thành các phép toán tích chập.", "Chương 2"),
            ("FPS", "Frames Per Second", "Số khung hình xử lý được trong một giây: thước đo tốc độ đáp ứng thời gian thực của camera AI (đạt 25,8 - 30 FPS).", "Chương 2, 3, 4"),
            ("RGB", "Red - Green - Blue", "Không gian màu 3 kênh chuẩn: Đỏ, Xanh lá, Xanh dương, định dạng ảnh đầu vào chuẩn của mô hình YOLO11n.", "Chương 2, 3"),
            ("BGR", "Blue - Green - Red", "Thứ tự kênh màu mặc định khi thư viện OpenCV thu nhận khung hình từ phần cứng camera USB.", "Chương 2, 3"),
            ("BatchNorm", "Batch Normalization", "Chuẩn hóa theo lô: kỹ thuật ổn định phân phối đầu vào của từng lớp nơ-ron, giúp mạng hội tụ nhanh và ổn định hơn.", "Chương 2"),
            ("SiLU", "Sigmoid Linear Unit", "Hàm kích hoạt phi tuyến tính dạng f(x) = x * sigmoid(x), giúp duy trì gradient mượt mà trong các khối nơ-ron sâu của YOLO.", "Chương 2"),
            ("AdamW", "Adaptive Moment Estimation with Decoupled Weight Decay", "Thuật toán tối ưu hóa thích nghi tách rời sự suy giảm trọng số, được cấu hình trong checkpoint huấn luyện v3_final của YOLO11n.", "Chương 3"),
            ("ROI", "Region of Interest", "Vùng ảnh quan tâm: vùng không gian bao quanh miệng giỏ xe đẩy nơi diễn ra thao tác bỏ/lấy hàng, giúp tăng độ tin cậy AI.", "Chương 3, 4")
        ]
    },
    {
        "group_name": "NHÓM 2: HỆ THỐNG NHÚNG, PHẦN CỨNG & CẢM BIẾN IoT (EMBEDDED SYSTEMS & IoT SENSORS)",
        "description": "Các thiết bị phần cứng, vi mạch, cảm biến trọng lượng, cảm biến quang học, kiến trúc vi xử lý và chuẩn kết nối vật lý gắn trên xe đẩy.",
        "terms": [
            ("IoT", "Internet of Things", "Mạng lưới vạn vật kết nối Internet: kiến trúc kết nối các thiết bị vật lý, cảm biến, máy tính nhúng với nền tảng máy chủ dịch vụ.", "Chương 1, 2, 3, 5"),
            ("SoC", "System on a Chip", "Hệ thống tích hợp trên một vi mạch: chip Broadcom BCM2711 chứa CPU, GPU và các bộ điều khiển ngoại vi trên Raspberry Pi 4.", "Chương 4"),
            ("MCU", "Microcontroller Unit", "Khối vi điều khiển: bo mạch/chip điều khiển xử lý và thu thập tín hiệu phần cứng tại biên.", "Chương 1"),
            ("ARM", "Advanced RISC Machine", "Kiến trúc tập lệnh vi xử lý thu gọn (RISC) tiết kiệm điện năng, nền tảng vi xử lý của bo mạch Raspberry Pi 4 Model B.", "Chương 4"),
            ("Cortex-A72", "ARM Cortex-A72", "Kiến trúc nhân vi xử lý 64-bit 4 nhân xung nhịp 1,5 GHz trong SoC BCM2711 của Raspberry Pi 4.", "Chương 4"),
            ("BCM2711", "Broadcom BCM2711", "Mã hiệu chip SoC xử lý trung tâm 4 nhân 64-bit ARM Cortex-A72 của Raspberry Pi 4 Model B.", "Chương 4"),
            ("BCM", "Broadcom GPIO Pinout", "Chuẩn đánh số chân GPIO của Raspberry Pi dựa trên chân tín hiệu của chip Broadcom (ví dụ BCM14, BCM15, BCM23, BCM24).", "Chương 2, 3"),
            ("GPIO", "General-Purpose Input/Output", "Cụm chân cắm vào/ra đa dụng 40 chân trên bo mạch Raspberry Pi 4 dùng để điều khiển tín hiệu cảm biến và ngoại vi.", "Chương 1, 2, 3"),
            ("DMA", "Direct Memory Access", "Truy cập bộ nhớ trực tiếp: cơ chế phần cứng nhúng giúp đọc xung nhịp chip cân HX711 chuẩn xác mà không chiếm dụng tài nguyên CPU.", "Chương 3, 4"),
            ("Loadcell", "Load Cell", "Cảm biến đo lực / khối lượng: cấu trúc thanh nhôm gắn cầu biến trở Wheatstone biến đổi biến dạng cơ học thành điện áp vi sai.", "Chương 1, 2, 3, 4, 5"),
            ("HX711", "HX711 Load Cell Amplifier & 24-bit ADC", "Vi mạch tích hợp tiền khuếch đại điện áp và chuyển đổi tương tự - số độ phân giải cao 24-bit chuyên dụng cho cảm biến cân.", "Chương 2, 3, 4, 5"),
            ("ADC", "Analog-to-Digital Converter", "Bộ chuyển đổi tín hiệu tương tự sang tín hiệu số, cụ thể là vi mạch 24-bit HX711 lấy mẫu dữ liệu cân nặng ở tần số 10 Hz - 80 Hz.", "Chương 2, 3, 4"),
            ("DOUT", "Data Out", "Chân xuất dữ liệu nối tiếp 24-bit của chip ADC HX711 sang chân GPIO của Raspberry Pi.", "Chương 2, 3"),
            ("SCK / PD_SCK", "Power Down & Serial Clock Input", "Chân xung nhịp đồng hồ điều khiển dịch 24 bit dữ liệu và điều khiển chế độ ngủ tiết kiệm nguồn của chip HX711.", "Chương 2, 3"),
            ("DVDD", "Digital Power Supply Voltage", "Chân điện áp cấp nguồn cho khối mạch số logic của chip ADC HX711 (2,6V - 5,5V).", "Chương 3"),
            ("ToF", "Time of Flight", "Nguyên lý đo khoảng cách bằng cách đo thời gian bay khứ hồi của chùm tia photon ánh sáng phát ra và phản xạ trở lại.", "Chương 1, 2, 3, 4, 5"),
            ("VL53L0X", "VL53L0X Time-of-Flight Ranging Sensor", "Module cảm biến đo khoảng cách laser ToF của STMicroelectronics sử dụng giám sát chuyển động đưa tay qua miệng giỏ xe.", "Chương 2, 3, 4, 5"),
            ("VCSEL", "Vertical-Cavity Surface-Emitting Laser", "Bộ phát laser bề mặt khoang thẳng đứng bước sóng hồng ngoại an toàn 940 nm tích hợp bên trong cảm biến VL53L0X.", "Chương 2"),
            ("SPAD", "Single Photon Avalanche Diode", "Mảng diode thác quang điện tử đơn photon độ nhạy cực cao dùng thu nhận xung laser phản xạ trong cảm biến ToF.", "Chương 2"),
            ("XSHUT", "External Shutdown Pin", "Chân điều khiển ngắt/bật nguồn logic của VL53L0X, dùng để bật tuần tự từng cảm biến nhằm cấu hình lại địa chỉ I2C độc lập.", "Chương 2, 3"),
            ("GM65", "GM65 Optical Barcode & QR Reader Module", "Module mắt đọc mã vạch 1D và QR Code 2D CMOS quang học, đóng vai trò cứu hộ (Fallback) khi camera AI bị che khuất.", "Chương 1, 2, 3, 4, 5"),
            ("CAM0 / CAM2", "Camera 0 / Camera 2", "Định danh cụm 2 camera UVC góc rộng gắn đối xứng hai bên thành xe để quan sát bao quát toàn bộ miệng giỏ hàng.", "Chương 3, 4"),
            ("CSI", "Camera Serial Interface", "Chuẩn giao diện nối tiếp tốc độ cao của liên minh MIPI dùng cắm camera chuyên dụng trực tiếp vào bo mạch Raspberry Pi.", "Chương 3"),
            ("UVC", "USB Video Class", "Chuẩn giao thức kết nối thiết bị video qua cổng USB tiêu chuẩn không cần cài driver riêng, tương thích hoàn toàn với Linux V4L2.", "Chương 3"),
            ("V4L2", "Video4Linux2", "Hệ thống driver và khung API xử lý video thu nhận thời gian thực trên nhân hệ điều hành Linux của Raspberry Pi.", "Chương 3, 4"),
            ("MJPG", "Motion JPEG", "Định dạng luồng video nén khung hình JPEG qua cổng USB UVC, giúp giảm tải băng thông truyền nhận trên bus USB của Pi 4.", "Chương 3"),
            ("TPU", "Tensor Processing Unit", "Bộ xử lý gia tốc tensor phần cứng chuyên dụng (ví dụ Google Coral Edge TPU) dùng gia tốc mạng nơ-ron học sâu.", "Chương 5"),
            ("NPU", "Neural Processing Unit", "Bộ vi xử lý thần kinh chuyên dụng xử lý các phép toán nơ-ron AI với hiệu suất năng lượng vượt trội.", "Chương 5"),
            ("CPU", "Central Processing Unit", "Bộ vi xử lý trung tâm của trạm biên Raspberry Pi 4 Model B (4 nhân ARM Cortex-A72).", "Chương 2, 4"),
            ("GPU", "Graphics Processing Unit", "Bộ vi xử lý đồ họa (VideoCore VI trên Pi 4 và card đồ họa chuyên dụng trên máy chủ huấn luyện AI).", "Chương 2, 4"),
            ("RAM", "Random Access Memory", "Bộ nhớ truy xuất ngẫu nhiên tạm thời của hệ thống (Pi 4 trang bị RAM 8 GB LPDDR4, Server trang bị 16 GB DDR4).", "Chương 2, 3, 4"),
            ("LPDDR4", "Low-Power Double Data Rate 4", "Chuẩn bộ nhớ RAM thế hệ 4 tiết kiệm năng lượng tích hợp trên bo mạch Raspberry Pi 4 Model B.", "Chương 4"),
            ("DDR4", "Double Data Rate 4", "Chuẩn bộ nhớ RAM tốc độ cao của máy tính chủ Backend.", "Chương 4"),
            ("SSD", "Solid State Drive", "Ổ cứng thể rắn tốc độ cao trên máy chủ Backend lưu trữ cơ sở dữ liệu quan hệ PostgreSQL.", "Chương 4"),
            ("NVMe", "Non-Volatile Memory Express", "Giao thức truyền dữ liệu ổ cứng thể rắn qua bus PCIe tốc độ cao, tối ưu hóa thông lượng truy xuất CSDL máy chủ.", "Chương 4"),
            ("GND", "Ground", "Chân nối đất / mức điện thế tham chiếu 0V trong sơ đồ mạch điện xe đẩy.", "Chương 3"),
            ("IC", "Integrated Circuit", "Mạch tích hợp / vi mạch bán dẫn.", "Chương 2, 3")
        ]
    },
    {
        "group_name": "NHÓM 3: CHUẨN GIAO TIẾP & GIAO THỨC TRUYỀN THÔNG (COMMUNICATION & NETWORKING PROTOCOLS)",
        "description": "Các chuẩn bus truyền thông nối tiếp nhúng và giao thức truyền thông mạng liên kết giữa các thiết bị ngoại vi, trạm biên và máy chủ.",
        "terms": [
            ("I2C", "Inter-Integrated Circuit", "Chuẩn truyền thông nối tiếp đồng bộ 2 dây gồm đường dữ liệu SDA và xung nhịp SCL, chia sẻ chung bus kết nối 3 cảm biến ToF.", "Chương 1, 2, 3"),
            ("SDA", "Serial Data Line", "Đường truyền tín hiệu dữ liệu hai chiều trong chuẩn giao tiếp nối tiếp I2C.", "Chương 3"),
            ("SCL", "Serial Clock Line", "Đường truyền tín hiệu xung nhịp đồng hồ đồng bộ trong chuẩn giao tiếp nối tiếp I2C.", "Chương 3"),
            ("UART", "Universal Asynchronous Receiver-Transmitter", "Bộ truyền nhận nối tiếp bất đồng bộ qua hai chân truyền TX và nhận RX, kết nối module GM65 ở baudrate 9600 bps.", "Chương 1, 2, 3, 4"),
            ("USB", "Universal Serial Bus", "Chuẩn giao tiếp bus nối tiếp đa năng kết nối 2 camera UVC và mắt quét GM65 vào 4 cổng USB của Raspberry Pi 4.", "Chương 2, 3, 4"),
            ("USB VCom", "USB Virtual COM Port", "Chế độ giao tiếp cổng nối tiếp ảo qua kết nối cáp USB của đầu quét mã vạch GM65.", "Chương 2"),
            ("Wi-Fi", "Wireless Fidelity", "Mạng truyền thông không dây cục bộ nội bộ siêu thị kết nối xe đẩy với máy chủ Backend.", "Chương 4"),
            ("IEEE 802.11ac", "IEEE 802.11ac (Wi-Fi 5)", "Chuẩn mạng không dây tốc độ cao băng tần kép 5 GHz, đảm bảo thời gian Ping khứ hồi trung bình dưới 3 ms.", "Chương 4"),
            ("Ping / RTT", "Packet Internet Groper / Round-Trip Time", "Thước đo thời gian trễ khứ hồi của gói tin mạng truyền qua lại giữa Raspberry Pi và máy chủ Backend.", "Chương 4"),
            ("HTTP / HTTPS", "Hypertext Transfer Protocol / Secure", "Giao thức truyền tải siêu văn bản an toàn dùng cho kết nối trao đổi dữ liệu REST API giữa client và server.", "Chương 3, 4"),
            ("WebSocket", "WebSocket Protocol", "Giao thức truyền thông song công toàn phần (Full-duplex) 2 chiều liên tục qua kênh TCP, đề xuất để hạ trễ cập nhật giỏ hàng xuống dưới 50 ms.", "Chương 5"),
            ("MQTT", "Message Queuing Telemetry Transport", "Giao thức truyền thông điệp siêu nhẹ dạng Publish/Subscribe dành riêng cho các thiết bị IoT trong điều kiện mạng hạn chế.", "Chương 5"),
            ("ThingsBoard Cloud", "ThingsBoard IoT Cloud Platform", "Nền tảng đám mây IoT mã nguồn mở phục vụ thu thập dữ liệu viễn trắc telemetry, vẽ biểu đồ hành trình và giám sát xe đẩy từ xa.", "Chương 3, 5")
        ]
    },
    {
        "group_name": "NHÓM 4: PHẦN MỀM BACKEND, CƠ SỞ DỮ LIỆU & KIẾN TRÚC HỆ THỐNG (BACKEND, DATABASE & ARCHITECTURE)",
        "description": "Các công nghệ máy chủ trung tâm, hệ quản trị cơ sở dữ liệu quan hệ, mẫu thiết kế kiến trúc và chuẩn mực bảo đảm toàn vẹn giao dịch.",
        "terms": [
            ("Backend", "Backend Server Tier", "Tầng máy chủ trung tâm đảm nhiệm xử lý logic đối soát đa cảm biến, tính toán hóa đơn, thanh toán và quản trị CSDL.", "Chương 1, 3, 4, 5"),
            ("FastAPI", "FastAPI Framework", "Framework máy chủ web Python bất đồng bộ hiện đại hiệu năng cao, xây dựng hệ thống 6 endpoints tiếp nhận telemetry và ra phán quyết giỏ hàng.", "Chương 3, 4, 5"),
            ("ASGI", "Asynchronous Server Gateway Interface", "Chuẩn giao diện cổng máy chủ web bất đồng bộ trong Python (chạy trên Uvicorn), hỗ trợ xử lý hàng nghìn kết nối đồng thời từ các xe đẩy.", "Chương 4"),
            ("ProcessTimeMiddleware", "FastAPI ProcessTime Middleware", "Lớp phần mềm trung gian tại máy chủ FastAPI tính toán chính xác vi sai thời gian xử lý nội bộ của API đối soát.", "Chương 4"),
            ("PostgreSQL", "PostgreSQL Relational Database", "Hệ quản trị CSDL quan hệ đối tượng mã nguồn mở mạnh mẽ, lưu trữ CSDL stroller_db chuẩn hóa 3NF gồm 6 bảng nghiệp vụ cốt lõi.", "Chương 3, 4, 5"),
            ("CSDL", "Cơ sở dữ liệu (Database)", "Hệ thống lưu trữ dữ liệu tập trung quản lý thông tin phiên mua hàng, danh mục sản phẩm, chi tiết giỏ hàng và lịch sử giao dịch.", "Chương 3, 5"),
            ("SQL", "Structured Query Language", "Ngôn ngữ truy vấn có cấu trúc dùng để thao tác, truy vấn và cập nhật dữ liệu trong CSDL quan hệ PostgreSQL.", "Chương 3"),
            ("SQLite", "SQLite Embedded Database", "Hệ quản trị CSDL nhúng siêu nhẹ lưu cục bộ trên thẻ nhớ Pi 4 làm hàng đợi ngoại tuyến (Offline Journal) khi mạng Wi-Fi bị ngắt.", "Chương 3, 4"),
            ("ACID", "Atomicity, Consistency, Isolation, Durability", "Bốn thuộc tính toàn vẹn giao dịch của CSDL quan hệ: Nguyên tử, Nhất quán, Cô lập và Bền vững; bảo đảm đơn hàng không bị lỗi nửa chừng.", "Chương 3, 5"),
            ("Idempotency", "Idempotence / Idempotency", "Tính lũy đẳng: cơ chế xử lý gói tin có mã khóa duy nhất, đảm bảo nếu xe đẩy gửi lặp lại một sự kiện thì hệ thống vẫn chỉ ghi nhận đúng 1 lần.", "Chương 3, 5"),
            ("UPSERT", "Update or Insert (ON CONFLICT DO UPDATE)", "Kỹ thuật trong câu lệnh SQL PostgreSQL: nếu sản phẩm đã có trong giỏ hàng thì tăng số lượng, nếu chưa có thì chèn mới, bảo đảm tính bất biến.", "Chương 3"),
            ("UNIQUE", "UNIQUE SQL Constraint", "Ràng buộc duy nhất trên cột client_event_id của CSDL PostgreSQL, triệt tiêu hoàn toàn rủi ro cộng trùng sản phẩm khi mạng gửi lặp.", "Chương 4"),
            ("UUID / ID", "Universally Unique Identifier", "Chuỗi mã định danh duy nhất toàn cầu 128-bit, dùng gán mã phiên session_id và mã sự kiện giỏ hàng client_event_id.", "Chương 3"),
            ("Transactional Outbox Pattern", "Transactional Outbox Pattern", "Mẫu thiết kế kiến trúc phân tán đảm bảo các sự kiện cập nhật giỏ hàng và tin nhắn thông báo được gửi đi tin cậy mà không mất mát.", "Chương 5"),
            ("Redis", "Remote Dictionary Server", "Hệ thống lưu trữ cấu trúc dữ liệu khóa - giá trị trên bộ nhớ RAM (In-Memory Cache), đề xuất bổ sung để hạ độ trễ Backend xuống dưới 15 ms.", "Chương 5"),
            ("Mock Bank", "Simulated Banking Server", "Máy chủ ngân hàng giả lập (chạy cổng 4000) mô phỏng quy trình xử lý thanh toán và bắn Webhook xác nhận giao dịch trong phòng thí nghiệm.", "Chương 5"),
            ("API", "Application Programming Interface", "Giao diện lập trình ứng dụng: tập hợp các endpoint RESTful do FastAPI cung cấp để kết nối thiết bị biên và giao diện.", "Chương 1, 3, 4"),
            ("REST / RESTful", "Representational State Transfer", "Kiến trúc thiết kế dịch vụ web chuẩn mực sử dụng phương thức HTTP có định dạng dữ liệu truyền nhận dạng JSON.", "Chương 3"),
            ("JSON", "JavaScript Object Notation", "Định dạng trao đổi dữ liệu dạng chuỗi văn bản tiêu chuẩn trong các gói tin REST API giữa Raspberry Pi, Backend và Tablet App.", "Chương 3"),
            ("SDK", "Software Development Kit", "Bộ công cụ phát triển phần mềm kết nối do các đơn vị cung cấp cổng thanh toán số (VNPay, MoMo, ZaloPay) phát hành.", "Chương 5"),
            ("DevOps", "Development and Operations", "Phương pháp kết hợp phát triển và vận hành hệ thống: quản lý dịch vụ nền, Docker, ThingsBoard và đường hầm mạng Ngrok.", "Chương 3")
        ]
    },
    {
        "group_name": "NHÓM 5: GIAO DIỆN NGƯỜI DÙNG, ỨNG DỤNG DI ĐỘNG & NỀN TẢNG WEB (FRONTEND, MOBILE & WEB)",
        "description": "Các công nghệ lập trình giao diện Tablet trên xe đẩy, ứng dụng web quản trị siêu thị và cổng ứng dụng web di động phục vụ khách hàng.",
        "terms": [
            ("Frontend", "Frontend Client Tier", "Tầng ứng dụng giao diện tương tác trực tiếp với người dùng bao gồm App Tablet trên xe, Web Admin và Web PWA.", "Chương 1, 3"),
            ("UI", "User Interface", "Giao diện đồ họa người dùng hiển thị thông tin sản phẩm, giỏ hàng, thông báo lỗi và hóa đơn thanh toán.", "Chương 3, 4"),
            ("Tablet App", "Tablet Application", "Ứng dụng Android chạy trên máy tính bảng gắn trên tay đẩy xe đẩy, cung cấp giao diện giỏ hàng số hóa thời gian thực cho người mua.", "Chương 1, 3, 4, 5"),
            ("MVVM", "Model – View – ViewModel", "Kiến trúc thiết kế phần mềm ứng dụng Android Tablet, phân tách rạch ròi giữa giao diện UI, tầng quản lý trạng thái và tầng dữ liệu.", "Chương 3"),
            ("ViewModel", "Architecture Component ViewModel", "Thành phần kiến trúc trong Android Jetpack lưu trữ và quản lý trạng thái dữ liệu UI, tồn tại độc lập qua các vòng đời màn hình.", "Chương 3"),
            ("StateFlow", "Kotlin Coroutines StateFlow", "Luồng dữ liệu trạng thái bất biến có nhận thức vòng đời trong Kotlin, tự động phát tín hiệu cập nhật giao diện mỗi khi giỏ hàng biến động.", "Chương 3"),
            ("Jetpack Compose", "Android Jetpack Compose", "Bộ công cụ hiện đại của Google xây dựng giao diện Android dạng khai báo (Declarative UI), tối ưu hóa hiệu năng render đồ họa.", "Chương 4"),
            ("LazyColumn", "Jetpack Compose LazyColumn", "Thành phần danh sách cuộn tải động trong Jetpack Compose, chỉ dựng các phần tử hiển thị trên màn hình giúp App giỏ hàng chạy mượt mà.", "Chương 3, 4"),
            ("LazyListState", "LazyListState Holder", "Đối tượng quản lý trạng thái cuộn của LazyColumn, kết hợp derivedStateOf để ngăn chặn hiện tượng vẽ lại giao diện không cần thiết.", "Chương 4"),
            ("RenderThread", "Android RenderThread", "Luồng dựng hình chuyên trách cấp hệ điều hành Android tiếp nhận lệnh vẽ và tương tác trực tiếp với phần cứng GPU.", "Chương 4"),
            ("VSync", "Vertical Synchronization", "Đồng bộ khung hình dọc: tín hiệu phần cứng đồng bộ tốc độ dựng hình của GPU với tần số quét của màn hình máy tính bảng (60 Hz).", "Chương 4"),
            ("Web Admin", "Web Administration Platform", "Nền tảng web quản trị siêu thị (xây dựng bằng Next.js 14) dành cho nhân viên theo dõi dòng tiền, đơn hàng, kho bãi và vị trí xe đẩy.", "Chương 3, 5"),
            ("Next.js 14", "Next.js 14 Framework", "Framework React hiện đại hỗ trợ kiến trúc kết xuất phía máy chủ (App Router), tối ưu hóa tốc độ tải trang Web Admin.", "Chương 3"),
            ("Tailwind CSS / CSS", "Tailwind Cascading Style Sheets", "Bộ công cụ định kiểu giao diện web tiện ích dạng utility-first, giúp tối ưu hóa giao diện trang quản trị siêu thị.", "Chương 3"),
            ("PWA", "Progressive Web App", "Ứng dụng web cấp tiến dành cho khách hàng: giao diện web di động có khả năng cài đặt như ứng dụng native, tích điểm và quét mã hội viên.", "Chương 3, 5"),
            ("QR / VietQR", "Quick Response Code / VietQR", "Mã ma trận 2D phản hồi nhanh; dùng để quét mã hội viên trên PWA và xuất mã chuyển khoản ngân hàng tự động VietQR Napas 24/7.", "Chương 3, 5")
        ]
    },
    {
        "group_name": "NHÓM 6: THUẬT NGỮ NGHIỆP VỤ BÁN LẺ, ĐƠN VỊ ĐO LƯỜNG & THỐNG KÊ KIỂM THỬ (RETAIL METRICS & EVALUATION)",
        "description": "Các chỉ số đánh giá nghiệp vụ bán lẻ, mã vạch tiêu chuẩn, phân vị độ trễ đo kiểm, các sự kiện chuyển đổi trạng thái và mã ca kiểm thử.",
        "terms": [
            ("SKU", "Stock Keeping Unit", "Mã phân loại đơn vị hàng hóa độc nhất trong kho và quầy kệ siêu thị (ví dụ 5 SKU: Poca, Sữa đặc, Sữa Vina, Khăn ướt, Cà phê G7).", "Chương 2, 3, 4, 5"),
            ("RPC", "Retail Product Checkout Dataset", "Tập dữ liệu chuẩn phục vụ nghiên cứu bài toán nhận diện và đếm nhiều sản phẩm tại quầy thanh toán tự động.", "Chương 2"),
            ("RP2K", "Retail Product 2000 Dataset", "Tập dữ liệu thị giác bán lẻ quy mô lớn gồm hơn 2.000 sản phẩm có bao bì và hình thái gần giống nhau.", "Chương 2"),
            ("SKU-110K", "Stock Keeping Unit 110K Dataset", "Tập dữ liệu chuẩn nghiên cứu phát hiện vật thể mật độ dày đặc với hơn 110.000 danh mục sản phẩm.", "Chương 2"),
            ("IncreACO", "Incremental Automated Checkout", "Phương pháp thanh toán tự động học tăng cường, giúp cập nhật lớp sản phẩm mới mà không làm suy giảm chất lượng các lớp cũ.", "Chương 2"),
            ("KPI", "Key Performance Indicator", "Các chỉ số đo lường hiệu quả kinh doanh cốt lõi (Doanh thu hôm nay, Số đơn hàng, Lượt khách) hiển thị trên Dashboard của Web Admin.", "Chương 3"),
            ("SLA", "Service Level Agreement", "Cam kết mức dịch vụ: ngưỡng thời gian tối đa hệ thống cho phép phản hồi (chuẩn nội bộ Backend SLA dưới 50 ms và ngưỡng cảm nhận dưới 100 ms).", "Chương 4"),
            ("P50", "50th Percentile (Median)", "Phân vị thời gian trễ 50% (Trung vị): 50% số yêu cầu phản hồi nhanh hơn mốc này (đạt 24,8 ms ở Backend và 12,4 ms ở UI).", "Chương 4"),
            ("P90 / P95", "90th / 95th Percentile", "Phân vị thời gian trễ 90% và 95%: mốc đo lường thời gian đáp ứng của hệ thống dưới điều kiện tải cao (đạt 38,2 ms và 43,5 ms).", "Chương 4"),
            ("P99", "99th Percentile", "Phân vị thời gian trễ 99%: phản ánh trường hợp trễ xấu nhất ở đuôi phân phối (Backend đạt 58,1 ms, nằm an toàn dưới ngưỡng 100 ms).", "Chương 4, 5"),
            ("MAE", "Mean Absolute Error", "Sai số tuyệt đối trung bình: chỉ số thống kê đo mức độ sai lệch trọng lượng của cảm biến cân Loadcell qua các lần lặp lại.", "Chương 4"),
            ("R_ToF", "ToF Detection Rate", "Tỷ lệ phát hiện đúng chuyển động tay của cụm cảm biến khoảng cách ToF.", "Chương 4"),
            ("TC / TC-01 -> TC-05", "Test Case", "Mã định danh 5 ca kiểm thử tích hợp chức năng kịch bản: Happy Path, Lệch cân, AI mờ, Cứu hộ GM65, Rớt mạng.", "Chương 4"),
            ("Sensor Fusion", "Sensor Data Fusion", "Thuật toán hợp nhất dữ liệu đa cảm biến (Camera AI + Cân Loadcell + ToF) để ra quyết định cập nhật giỏ hàng chính xác 100%.", "Chương 1, 3, 5"),
            ("ACK", "Acknowledgment", "Gói tin tín hiệu xác nhận phản hồi thành công trong luồng giao tiếp giữa Backend, Pi và Tablet.", "Chương 3, 4"),
            ("ADD", "Action: ADD", "Thao tác khách hàng chọn sản phẩm bỏ vào lòng xe đẩy (khối lượng giỏ hàng tăng Delta W > 0).", "Chương 3, 4"),
            ("REMOVE", "Action: REMOVE", "Thao tác khách hàng lấy sản phẩm ra khỏi xe đẩy (khối lượng giỏ hàng giảm Delta W < 0).", "Chương 3, 4"),
            ("ENTER", "Event: ENTER", "Mốc thời gian cảm biến ToF phát hiện tay/hàng bắt đầu đi vào vùng miệng giỏ hàng.", "Chương 3, 4"),
            ("CLEAR", "Event: CLEAR", "Mốc thời gian cảm biến ToF phát hiện tay đã rút hoàn toàn khỏi miệng giỏ hàng, kích hoạt chốt cân và chụp ảnh.", "Chương 3, 4"),
            ("EAN / EAN-13", "European Article Number 13", "Chuẩn mã vạch sản phẩm quốc tế gồm 13 chữ số in trên bao bì hàng hóa siêu thị.", "Chương 1, 3, 4"),
            ("USD", "United States Dollar", "Đô la Mỹ: đơn vị tiền tệ trích dẫn trong nghiên cứu thiệt hại do hàng đợi thanh toán của Adyen (37,7 tỷ USD).", "Chương 1"),
            ("kg", "Kilogram", "Kilôgam: đơn vị đo khối lượng tiêu chuẩn (tải trọng định mức của bàn cân là 10 kg).", "Chương 1"),
            ("GB", "Gigabyte", "Đơn vị đo dung lượng bộ nhớ RAM (1 GB = 1.024 MB).", "Chương 2, 3, 4"),
            ("MB", "Megabyte", "Đơn vị đo dung lượng tệp tin và mô hình trọng số.", "Chương 2, 3, 4"),
            ("KB", "Kilobyte", "Đơn vị đo dung lượng dữ liệu nhỏ.", "Chương 4"),
            ("GHz", "Gigahertz", "Đơn vị đo tần số xung nhịp vi xử lý và sóng vô tuyến Wi-Fi.", "Chương 4"),
            ("CSV", "Comma-Separated Values", "Định dạng tệp dữ liệu phân tách bằng dấu phẩy lưu trữ cấu hình trọng lượng và số liệu kiểm thử.", "Chương 3"),
            ("ZIP", "ZIP Archive", "Định dạng nén tệp tin chứa bộ dữ liệu 4.826 ảnh xuất từ nền tảng Roboflow.", "Chương 3"),
            ("SHA256", "Secure Hash Algorithm 256-bit", "Thuật toán băm an toàn 256-bit dùng để kiểm tra tính toàn vẹn và xác thực chữ ký của mô hình AI.", "Chương 4")
        ]
    }
]

def build_docx():
    doc = docx.Document()
    
    # Page setup: Standard Vietnamese Thesis Margins (A4: Top 2cm, Bottom 2cm, Left 3cm, Right 2cm)
    for s in doc.sections:
        s.top_margin = Inches(0.79)     # 2.0 cm
        s.bottom_margin = Inches(0.79)  # 2.0 cm
        s.left_margin = Inches(1.18)    # 3.0 cm
        s.right_margin = Inches(0.79)   # 2.0 cm
        
        # Header / Footer
        footer = s.footer
        p_ft = footer.paragraphs[0]
        p_ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_ft = p_ft.add_run("Báo cáo NCKH: Xe đẩy Mua sắm Thông minh AIoT — Danh mục Từ viết tắt")
        r_ft.font.name = "Times New Roman"
        r_ft.font.size = Pt(9)
        r_ft.italic = True
        r_ft.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    # Base style
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    def set_cell_background(cell, fill_hex):
        tcPr = cell._element.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=70, bottom=70, left=90, right=90):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_cell_border(cell, **kwargs):
        tc = cell._element
        tcPr = tc.get_or_add_tcPr()
        tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
        for edge in ('top', 'left', 'bottom', 'right'):
            edge_data = kwargs.get(edge)
            if edge_data:
                tag = f'<w:{edge} {nsdecls("w")} w:val="{edge_data.get("val", "single")}" w:sz="{edge_data.get("sz", 4)}" w:space="0" w:color="{edge_data.get("color", "CBD5E1")}"/>'
                tcBorders.append(parse_xml(tag))
        tcPr.append(tcBorders)

    # Title
    p_t1 = doc.add_paragraph()
    p_t1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t1.paragraph_format.space_before = Pt(6)
    p_t1.paragraph_format.space_after = Pt(2)
    r_t1 = p_t1.add_run("HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG")
    r_t1.font.name = "Times New Roman"
    r_t1.font.size = Pt(12)
    r_t1.bold = True
    r_t1.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    p_t2 = doc.add_paragraph()
    p_t2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_t2.paragraph_format.space_before = Pt(0)
    p_t2.paragraph_format.space_after = Pt(12)
    r_t2 = p_t2.add_run("KHOA VIỄN THÔNG 2 — BÁO CÁO NGHIÊN CỨU KHOA HỌC")
    r_t2.font.name = "Times New Roman"
    r_t2.font.size = Pt(11)
    r_t2.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("DANH MỤC CÁC TỪ VIẾT TẮT VÀ THUẬT NGỮ KỸ THUẬT")
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(16)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Đề tài: Thiết kế và thi công mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ\n(Tổng hợp và phân nhóm chuyên môn toàn diện từ Chương 1 đến Chương 5)")
    r_sub.font.name = "Times New Roman"
    r_sub.font.size = Pt(11)
    r_sub.italic = True
    r_sub.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    # Intro text
    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_before = Pt(0)
    p_intro.paragraph_format.space_after = Pt(10)
    p_intro.paragraph_format.line_spacing = 1.25
    p_intro.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_in = p_intro.add_run("Danh mục dưới đây tổng hợp đầy đủ toàn bộ các chữ viết tắt, thuật ngữ kỹ thuật, ký hiệu linh kiện và chỉ số đánh giá xuất hiện xuyên suốt trong 5 chương của báo cáo nghiên cứu khoa học. Các thuật ngữ được phân loại khoa học thành 6 nhóm chuyên môn nhằm phục vụ công tác tra cứu, đối soát kỹ thuật và bảo vệ đồ án tốt nghiệp trước Hội đồng chuyên môn.")
    r_in.font.name = "Times New Roman"
    r_in.font.size = Pt(11)

    # Summary table of the 6 groups
    tb_stats = doc.add_table(rows=7, cols=3)
    tb_stats.alignment = WD_TABLE_ALIGNMENT.CENTER
    stats_data = [
        ("Nhóm 1: Trí tuệ nhân tạo, Thị giác máy tính & Học sâu (AI / CV)", "48 thuật ngữ", "YOLO11n, NMS, IoU, CIoU, DFL, mAP, NCNN, PTQ, QAT..."),
        ("Nhóm 2: Hệ thống nhúng, Phần cứng & Cảm biến IoT (Hardware)", "36 thuật ngữ", "SoC, Pi 4, Loadcell, HX711, ToF, VL53L0X, GM65, DMA..."),
        ("Nhóm 3: Chuẩn giao tiếp & Giao thức truyền thông (Protocols)", "13 thuật ngữ", "I2C, UART, USB, Wi-Fi 802.11ac, WebSocket, MQTT, ThingsBoard..."),
        ("Nhóm 4: Phần mềm Backend, Cơ sở dữ liệu & Kiến trúc (Backend & DB)", "21 thuật ngữ", "FastAPI, PostgreSQL, ACID, Idempotency, UPSERT, Redis..."),
        ("Nhóm 5: Giao diện người dùng, Mobile & Nền tảng Web (Frontend & Web)", "16 thuật ngữ", "Jetpack Compose, MVVM, StateFlow, Next.js 14, PWA, VietQR..."),
        ("Nhóm 6: Nghiệp vụ bán lẻ, Đơn vị đo lường & Thống kê kiểm thử", "28 thuật ngữ", "SKU, SLA, P50-P99, TC-01-TC-05, Sensor Fusion, MAE...")
    ]

    hdr_s = tb_stats.rows[0].cells
    hdr_titles = ["Phân nhóm chuyên môn kỹ thuật", "Số lượng", "Các thuật ngữ tiêu biểu"]
    for c_i, h_t in enumerate(hdr_titles):
        c = hdr_s[c_i]
        c.text = h_t
        set_cell_background(c, "1E3A8A")
        set_cell_margins(c, top=60, bottom=60, left=80, right=80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(9.5)
        p.runs[0].bold = True
        p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for r_i, (g_n, g_c, g_e) in enumerate(stats_data):
        row = tb_stats.rows[r_i + 1]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(2.5)
        c1.width = Inches(0.9)
        c2.width = Inches(3.1)
        c0.text = g_n
        c1.text = g_c
        c2.text = g_e
        bg = "F8FAFC" if r_i % 2 == 1 else "FFFFFF"
        for c_item, align in [(c0, WD_ALIGN_PARAGRAPH.LEFT), (c1, WD_ALIGN_PARAGRAPH.CENTER), (c2, WD_ALIGN_PARAGRAPH.LEFT)]:
            set_cell_background(c_item, bg)
            set_cell_margins(c_item, top=50, bottom=50, left=70, right=70)
            b_spec = {"val": "single", "sz": 4, "color": "CBD5E1"}
            set_cell_border(c_item, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
            p = c_item.paragraphs[0]
            p.alignment = align
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(9.0)
            if c_item == c0:
                p.runs[0].bold = True
                p.runs[0].font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            elif c_item == c1:
                p.runs[0].bold = True
                p.runs[0].font.color.rgb = RGBColor(0x04, 0x78, 0x57)
            else:
                p.runs[0].font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Iterate through the 6 groups and build detailed tables
    total_term_counter = 0

    for g_idx, group in enumerate(GROUPS_DATA):
        # Group heading
        p_gh = doc.add_paragraph()
        p_gh.paragraph_format.space_before = Pt(14)
        p_gh.paragraph_format.space_after = Pt(2)
        p_gh.paragraph_format.keep_with_next = True
        r_gh = p_gh.add_run(group["group_name"])
        r_gh.font.name = "Times New Roman"
        r_gh.font.size = Pt(12)
        r_gh.bold = True
        r_gh.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        # Group description
        p_gd = doc.add_paragraph()
        p_gd.paragraph_format.space_before = Pt(0)
        p_gd.paragraph_format.space_after = Pt(6)
        p_gd.paragraph_format.keep_with_next = True
        r_gd = p_gd.add_run(group["description"])
        r_gd.font.name = "Times New Roman"
        r_gd.font.size = Pt(10.5)
        r_gd.italic = True
        r_gd.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

        # Table for this group
        terms = group["terms"]
        tb = doc.add_table(rows=len(terms) + 1, cols=5)
        tb.alignment = WD_TABLE_ALIGNMENT.CENTER

        # Table header
        hdr_row = tb.rows[0]
        col_widths = [Inches(0.4), Inches(1.3), Inches(1.8), Inches(2.3), Inches(0.8)]
        col_headers = ["STT", "Từ viết tắt", "Thuật ngữ tiếng Anh đầy đủ", "Ý nghĩa / Định nghĩa kỹ thuật trong đề tài", "Chương"]

        for col_i, h_text in enumerate(col_headers):
            cell = hdr_row.cells[col_i]
            cell.width = col_widths[col_i]
            cell.text = h_text
            set_cell_background(cell, "1E3A8A")
            set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
            b_spec = {"val": "single", "sz": 4, "color": "CBD5E1"}
            set_cell_border(cell, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.runs[0].font.name = "Times New Roman"
            p.runs[0].font.size = Pt(8.8)
            p.runs[0].bold = True
            p.runs[0].font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        # Rows data
        for row_i, (abbr, en_name, vn_desc, ch_occ) in enumerate(terms):
            total_term_counter += 1
            row = tb.rows[row_i + 1]
            bg_col = "F8FAFC" if row_i % 2 == 1 else "FFFFFF"

            row_data = [
                (str(row_i + 1), WD_ALIGN_PARAGRAPH.CENTER, True, RGBColor(0x64, 0x74, 0x8B), "Times New Roman", 8.5),
                (abbr, WD_ALIGN_PARAGRAPH.LEFT, True, RGBColor(0x1E, 0x3A, 0x8A), "Consolas" if len(abbr) <= 10 else "Times New Roman", 9.0),
                (en_name, WD_ALIGN_PARAGRAPH.LEFT, False, RGBColor(0x0F, 0x17, 0x2A), "Times New Roman", 8.8),
                (vn_desc, WD_ALIGN_PARAGRAPH.JUSTIFY, False, RGBColor(0x33, 0x41, 0x55), "Times New Roman", 8.8),
                (ch_occ, WD_ALIGN_PARAGRAPH.CENTER, True, RGBColor(0x04, 0x78, 0x57), "Times New Roman", 8.0)
            ]

            for c_i, (val, align, is_bold, color, fname, fsize) in enumerate(row_data):
                cell = row.cells[c_i]
                cell.width = col_widths[c_i]
                cell.text = val
                set_cell_background(cell, bg_col)
                set_cell_margins(cell, top=50, bottom=50, left=65, right=65)
                b_spec = {"val": "single", "sz": 4, "color": "E2E8F0"}
                set_cell_border(cell, top=b_spec, bottom=b_spec, left=b_spec, right=b_spec)
                p = cell.paragraphs[0]
                p.alignment = align
                if p.runs:
                    p.runs[0].font.name = fname
                    p.runs[0].font.size = Pt(fsize)
                    p.runs[0].bold = is_bold
                    p.runs[0].font.color.rgb = color

        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Save destinations
    destinations = [
        r"c:\Users\LE THI HAU\.gemini\antigravity\scratch\StrollerApp\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.docx",
        r"C:\Users\LE THI HAU\Downloads\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.docx",
        r"C:\Users\LE THI HAU\Pictures\Screenshots\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.docx",
        r"c:\Users\LE THI HAU\Downloads\cơ sơ dữ liệu-0\Danh_Muc_Tu_Viet_Tat_Do_An_Tot_Nghiep.docx"
    ]

    for dest in destinations:
        try:
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            doc.save(dest)
            print(f"✅ Đã lưu file Word thành công tại: {dest}")
        except Exception as e:
            print(f"⚠️ Lỗi khi lưu {dest}: {e}")

if __name__ == "__main__":
    build_docx()
