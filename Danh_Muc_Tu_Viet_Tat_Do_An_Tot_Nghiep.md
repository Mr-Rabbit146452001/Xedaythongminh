# DANH MỤC CÁC TỪ VIẾT TẮT VÀ THUẬT NGỮ KỸ THUẬT
**Đồ án tốt nghiệp / Báo cáo NCKH:** Thiết kế và thi công mô hình xe đẩy mua sắm thông minh tích hợp AIoT cho siêu thị bán lẻ  
**Đơn vị đào tạo:** Học viện Công nghệ Bưu chính Viễn thông — Khoa Viễn thông 2  
**Quy mô trích xuất:** Tổng hợp toàn diện 162 thuật ngữ chuyên môn từ Chương 1 đến Chương 5 của báo cáo  

---

## BẢNG TỔNG QUAN PHÂN BỔ 6 NHÓM CHUYÊN MÔN KỸ THUẬT

| STT | Phân nhóm chuyên môn kỹ thuật | Số lượng | Các thuật ngữ tiêu biểu |
| :---: | :--- | :---: | :--- |
| 1 | **Nhóm 1: Trí tuệ nhân tạo, Thị giác máy tính & Học sâu (AI / CV)** | 48 thuật ngữ | YOLO11n, NMS, IoU, CIoU, DFL, mAP, NCNN, PTQ, QAT, ByteTrack... |
| 2 | **Nhóm 2: Hệ thống nhúng, Phần cứng & Cảm biến IoT (Hardware)** | 36 thuật ngữ | SoC, Pi 4, Loadcell, HX711, ToF, VL53L0X, GM65, DMA, VCSEL... |
| 3 | **Nhóm 3: Chuẩn giao tiếp & Giao thức truyền thông (Protocols)** | 13 thuật ngữ | I2C, UART, USB, Wi-Fi 802.11ac, WebSocket, MQTT, ThingsBoard... |
| 4 | **Nhóm 4: Phần mềm Backend, Cơ sở dữ liệu & Kiến trúc (Backend & DB)** | 21 thuật ngữ | FastAPI, PostgreSQL, ACID, Idempotency, UPSERT, Redis, Mock Bank... |
| 5 | **Nhóm 5: Giao diện người dùng, Mobile & Nền tảng Web (Frontend & Web)** | 16 thuật ngữ | Jetpack Compose, MVVM, StateFlow, Next.js 14, PWA, VietQR... |
| 6 | **Nhóm 6: Nghiệp vụ bán lẻ, Đơn vị đo lường & Thống kê kiểm thử** | 28 thuật ngữ | SKU, SLA, P50–P99, TC-01–TC-05, Sensor Fusion, MAE, R_ToF... |
| **TỔNG** | **Toàn bộ 6 nhóm chuyên môn đề tài** | **162 thuật ngữ** | **Phủ kín toàn bộ 5 chương của luận văn tốt nghiệp** |

---

### NHÓM 1: TRÍ TUỆ NHÂN TẠO, THỊ GIÁC MÁY TÍNH & HỌC SÂU (AI, COMPUTER VISION & DEEP LEARNING)

> *Các thuật ngữ, mô hình học máy, kiến trúc mạng nơ-ron, hàm mất mát và chỉ số đánh giá độ chính xác trong phân hệ nhận diện sản phẩm.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `AI` | **Artificial Intelligence** | Trí tuệ nhân tạo: lĩnh vực khoa học máy tính mô phỏng trí thông minh con người, ứng dụng trong tự động nhận diện hàng hóa. | *Chương 1, 2, 3, 4, 5* |
| 2 | `AIoT` | **Artificial Intelligence of Things** | Trí tuệ nhân tạo kết hợp mạng lưới vạn vật kết nối Internet: kiến trúc kết hợp thuật toán AI tại biên với hệ sinh thái IoT. | *Chương 5* |
| 3 | `Vision AI` | **Computer Vision Artificial Intelligence** | Trí tuệ nhân tạo thị giác máy tính: công nghệ trích xuất đặc trưng và phân loại đối tượng từ dữ liệu hình ảnh camera. | *Chương 1, 3, 5* |
| 4 | `Edge AI` | **Edge Artificial Intelligence** | Trí tuệ nhân tạo tại biên: kỹ thuật triển khai và thực thi suy luận mô hình học sâu trực tiếp trên vi xử lý nhúng (Raspberry Pi 4). | *Chương 2, 3, 5* |
| 5 | `CNN` | **Convolutional Neural Network** | Mạng nơ-ron tích chập: kiến trúc học sâu chuyên dụng cho xử lý và trích xuất đặc trưng không gian từ dữ liệu ma trận ảnh. | *Chương 2* |
| 6 | `YOLO` | **You Only Look Once** | Họ thuật toán phát hiện vật thể thời gian thực đơn pha (single-stage), dự đoán đồng thời vị trí khung bao và xác suất lớp đối tượng. | *Chương 1, 2, 3* |
| 7 | `YOLO11 / YOLO11n` | **YOLO Version 11 (Nano variant)** | Phiên bản thế hệ 11 của YOLO; biến thể nano (n) có số lượng tham số nhỏ nhất (2,6M tham số), tối ưu riêng cho phần cứng nhúng. | *Chương 1, 2, 3, 4, 5* |
| 8 | `YOLOv8n` | **YOLO Version 8 (Nano variant)** | Phiên bản nano tiền nhiệm của YOLO11, được sử dụng trong Chương 2 làm cơ sở đối chuẩn (benchmark) hiệu năng. | *Chương 2* |
| 9 | `COCO` | **Common Objects in Context** | Tập dữ liệu chuẩn học máy quốc tế gồm 80 lớp vật thể, được sử dụng để benchmark độ chính xác chuẩn cho các mô hình phát hiện vật thể. | *Chương 2* |
| 10 | `C3k2` | **Cross Stage Partial with Kernel 2** | Khối trích xuất đặc trưng mới trong YOLO11 phát triển từ CSPNet, tối ưu hóa đường truyền gradient và giảm tải tính toán. | *Chương 2* |
| 11 | `SPPF` | **Spatial Pyramid Pooling - Fast** | Khối gộp kim tự tháp không gian tốc độ cao, hỗ trợ trích xuất đặc trưng đa tỉ lệ mà không làm tăng độ trễ suy luận. | *Chương 2* |
| 12 | `C2PSA` | **CSP with Pointwise Spatial Attention** | Khối chú ý không gian điểm tăng cường trong YOLO11, tăng cường trọng số cho các vùng ảnh mang đặc trưng sản phẩm then chốt. | *Chương 2* |
| 13 | `QK^T` | **Query - Key Transpose** | Phép nhân ma trận giữa vectơ truy vấn (Query) và chuyển vị khóa (Key) trong cơ chế tự chú ý (Self-Attention). | *Chương 2* |
| 14 | `DFL` | **Distribution Focal Loss** | Hàm mất mát hồi quy phân bố: mô hình hóa vị trí biên khung bao thành phân bố xác suất rời rạc nhằm tăng độ chính xác định vị. | *Chương 2* |
| 15 | `TaskAlignedAssigner` | **Task-Aligned Sample Assigner** | Thuật toán gán nhãn mẫu mục tiêu trong huấn luyện YOLO, kết hợp hài hòa giữa điểm tin cậy phân loại và chất lượng định vị IoU. | *Chương 2* |
| 16 | `BCEWithLogitsLoss` | **Binary Cross-Entropy with Logits Loss** | Hàm mất mát entropy chéo nhị phân tích hợp sẵn hàm kích hoạt Sigmoid, dùng để tính tổn thất phân loại nhãn sản phẩm. | *Chương 2* |
| 17 | `IoU` | **Intersection over Union** | Tỷ số diện tích phần giao trên diện tích phần hợp giữa khung bao dự đoán và khung bao nhãn thực tế (Ground Truth). | *Chương 2, 3* |
| 18 | `CIoU` | **Complete Intersection over Union** | Hàm mất mát và chỉ số IoU toàn diện, đo lường đồng thời độ trùng lặp diện tích, khoảng cách tâm và sai lệch tỷ lệ khung hình. | *Chương 2* |
| 19 | `NMS` | **Non-Maximum Suppression** | Thuật toán triệt tiêu phi cực đại: loại bỏ các khung bao trùng lặp dự đoán cùng một sản phẩm, chỉ giữ lại khung có điểm số cao nhất. | *Chương 2, 3* |
| 20 | `TP` | **True Positive** | Dương tính thật: trường hợp mô hình phát hiện đúng sự hiện diện và phân loại đúng nhãn sản phẩm có trong giỏ. | *Chương 2* |
| 21 | `FP` | **False Positive** | Dương tính giả: trường hợp mô hình nhận diện nhầm sản phẩm không có hoặc định vị sai vùng không gian. | *Chương 2* |
| 22 | `FN` | **False Negative** | Âm tính giả: trường hợp sản phẩm có trong giỏ hàng nhưng mô hình bỏ sót không nhận diện được. | *Chương 2* |
| 23 | `P (Precision)` | **Precision** | Độ chính xác: tỷ lệ số dự đoán đúng trên tổng số lần mô hình đưa ra dự đoán (P = TP / (TP + FP)). | *Chương 2* |
| 24 | `R (Recall)` | **Recall** | Độ nhạy / Độ bao phủ: tỷ lệ số sản phẩm nhận diện được trên tổng số sản phẩm thực tế có mặt (R = TP / (TP + FN)). | *Chương 2* |
| 25 | `F1 / F1-Score` | **F1-Score** | Điểm F1: trung bình điều hòa giữa Precision và Recall (F1 = 2 * (P * R) / (P + R)), đánh giá chất lượng toàn diện của mô hình AI. | *Chương 2* |
| 26 | `AP` | **Average Precision** | Độ chính xác trung bình cho từng lớp sản phẩm cụ thể, tính bằng diện tích dưới đường cong Precision-Recall. | *Chương 2* |
| 27 | `mAP` | **mean Average Precision** | Độ chính xác trung bình toàn diện trên tất cả các lớp sản phẩm (ví dụ mAP@0.5 hoặc mAP@0.5:0.95). | *Chương 2* |
| 28 | `PR Curve` | **Precision-Recall Curve** | Đường cong biểu diễn mối quan hệ đánh đổi giữa độ chính xác (Precision) và độ nhạy (Recall) tại các ngưỡng tin cậy khác nhau. | *Chương 2* |
| 29 | `MOT` | **Multi-Object Tracking** | Kỹ thuật theo dõi đa đối tượng: thuật toán bám vết và duy trì định danh quỹ đạo di chuyển của nhiều sản phẩm cùng lúc. | *Chương 5* |
| 30 | `ByteTrack` | **ByteTrack Algorithm** | Thuật toán bám vết đối tượng đa luồng hiệu năng cao dựa trên việc liên kết cả các khung bao có điểm tin cậy thấp. | *Chương 5* |
| 31 | `DeepSORT` | **Deep Simple Online and Realtime Tracking** | Thuật toán theo dõi đối tượng thời gian thực kết hợp bộ lọc Kalman và mạng trích xuất đặc trưng ngoại hình sâu. | *Chương 5* |
| 32 | `ONNX` | **Open Neural Network Exchange** | Định dạng tệp mở trung gian cho phép chuyển giao mô hình học sâu giữa PyTorch và các môi trường thực thi nhúng. | *Chương 2* |
| 33 | `NCNN` | **Tencent NCNN Framework** | Thư viện thực thi suy luận mạng nơ-ron mã nguồn mở siêu nhẹ, tối ưu riêng cho kiến trúc CPU ARM trên thiết bị di động và nhúng. | *Chương 2, 3* |
| 34 | `PTQ` | **Post-Training Quantization** | Lượng tử hóa sau huấn luyện: kỹ thuật nén mô hình chuyển đổi trọng số từ số thực FP32 sang số nguyên INT8 mà không cần huấn luyện lại. | *Chương 2* |
| 35 | `QAT` | **Quantization-Aware Training** | Huấn luyện có nhận thức lượng tử hóa: mô phỏng lỗi làm tròn lượng tử hóa ngay trong quá trình train để giữ vững độ chính xác. | *Chương 2* |
| 36 | `FP32` | **32-bit Floating Point** | Định dạng số thực dấu phẩy động 32-bit (độ chính xác đơn), định dạng chuẩn trong huấn luyện mô hình học sâu. | *Chương 2* |
| 37 | `FP16` | **16-bit Floating Point** | Định dạng số thực dấu phẩy động 16-bit (nửa độ chính xác), giảm 50% dung lượng bộ nhớ so với FP32. | *Chương 2* |
| 38 | `INT8` | **8-bit Integer** | Định dạng số nguyên 8-bit, dùng trong lượng tử hóa giúp tiết kiệm 4 lần bộ nhớ RAM và tăng tốc tính toán trên phần cứng biên. | *Chương 2* |
| 39 | `FLOPs` | **Floating Point Operations** | Số phép tính toán số thực dấu phẩy động, phản ánh độ phức tạp thuật toán và chi phí tính toán của mô hình nơ-ron. | *Chương 2* |
| 40 | `GFLOPs` | **Giga Floating Point Operations** | Một tỷ phép tính toán số thực dấu phẩy động (mô hình YOLO11n tiêu tốn xấp xỉ 8,7 GFLOPs). | *Chương 2* |
| 41 | `MAC` | **Multiply-Accumulate Operation** | Phép tính nhân - cộng tích lũy (A = A + B * C), đơn vị thao tác vi xử lý cơ bản nhất cấu thành các phép toán tích chập. | *Chương 2* |
| 42 | `FPS` | **Frames Per Second** | Số khung hình xử lý được trong một giây: thước đo tốc độ đáp ứng thời gian thực của camera AI (đạt 25,8 - 30 FPS). | *Chương 2, 3, 4* |
| 43 | `RGB` | **Red - Green - Blue** | Không gian màu 3 kênh chuẩn: Đỏ, Xanh lá, Xanh dương, định dạng ảnh đầu vào chuẩn của mô hình YOLO11n. | *Chương 2, 3* |
| 44 | `BGR` | **Blue - Green - Red** | Thứ tự kênh màu mặc định khi thư viện OpenCV thu nhận khung hình từ phần cứng camera USB. | *Chương 2, 3* |
| 45 | `BatchNorm` | **Batch Normalization** | Chuẩn hóa theo lô: kỹ thuật ổn định phân phối đầu vào của từng lớp nơ-ron, giúp mạng hội tụ nhanh và ổn định hơn. | *Chương 2* |
| 46 | `SiLU` | **Sigmoid Linear Unit** | Hàm kích hoạt phi tuyến tính dạng f(x) = x * sigmoid(x), giúp duy trì gradient mượt mà trong các khối nơ-ron sâu của YOLO. | *Chương 2* |
| 47 | `AdamW` | **Adaptive Moment Estimation with Decoupled Weight Decay** | Thuật toán tối ưu hóa thích nghi tách rời sự suy giảm trọng số, được cấu hình trong checkpoint huấn luyện v3_final của YOLO11n. | *Chương 3* |
| 48 | `ROI` | **Region of Interest** | Vùng ảnh quan tâm: vùng không gian bao quanh miệng giỏ xe đẩy nơi diễn ra thao tác bỏ/lấy hàng, giúp tăng độ tin cậy AI. | *Chương 3, 4* |

---

### NHÓM 2: HỆ THỐNG NHÚNG, PHẦN CỨNG & CẢM BIẾN IoT (EMBEDDED SYSTEMS & IoT SENSORS)

> *Các thiết bị phần cứng, vi mạch, cảm biến trọng lượng, cảm biến quang học, kiến trúc vi xử lý và chuẩn kết nối vật lý gắn trên xe đẩy.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `IoT` | **Internet of Things** | Mạng lưới vạn vật kết nối Internet: kiến trúc kết nối các thiết bị vật lý, cảm biến, máy tính nhúng với nền tảng máy chủ dịch vụ. | *Chương 1, 2, 3, 5* |
| 2 | `SoC` | **System on a Chip** | Hệ thống tích hợp trên một vi mạch: chip Broadcom BCM2711 chứa CPU, GPU và các bộ điều khiển ngoại vi trên Raspberry Pi 4. | *Chương 4* |
| 3 | `MCU` | **Microcontroller Unit** | Khối vi điều khiển: bo mạch/chip điều khiển xử lý và thu thập tín hiệu phần cứng tại biên. | *Chương 1* |
| 4 | `ARM` | **Advanced RISC Machine** | Kiến trúc tập lệnh vi xử lý thu gọn (RISC) tiết kiệm điện năng, nền tảng vi xử lý của bo mạch Raspberry Pi 4 Model B. | *Chương 4* |
| 5 | `Cortex-A72` | **ARM Cortex-A72** | Kiến trúc nhân vi xử lý 64-bit 4 nhân xung nhịp 1,5 GHz trong SoC BCM2711 của Raspberry Pi 4. | *Chương 4* |
| 6 | `BCM2711` | **Broadcom BCM2711** | Mã hiệu chip SoC xử lý trung tâm 4 nhân 64-bit ARM Cortex-A72 của Raspberry Pi 4 Model B. | *Chương 4* |
| 7 | `BCM` | **Broadcom GPIO Pinout** | Chuẩn đánh số chân GPIO của Raspberry Pi dựa trên chân tín hiệu của chip Broadcom (ví dụ BCM14, BCM15, BCM23, BCM24). | *Chương 2, 3* |
| 8 | `GPIO` | **General-Purpose Input/Output** | Cụm chân cắm vào/ra đa dụng 40 chân trên bo mạch Raspberry Pi 4 dùng để điều khiển tín hiệu cảm biến và ngoại vi. | *Chương 1, 2, 3* |
| 9 | `DMA` | **Direct Memory Access** | Truy cập bộ nhớ trực tiếp: cơ chế phần cứng nhúng giúp đọc xung nhịp chip cân HX711 chuẩn xác mà không chiếm dụng tài nguyên CPU. | *Chương 3, 4* |
| 10 | `Loadcell` | **Load Cell** | Cảm biến đo lực / khối lượng: cấu trúc thanh nhôm gắn cầu biến trở Wheatstone biến đổi biến dạng cơ học thành điện áp vi sai. | *Chương 1, 2, 3, 4, 5* |
| 11 | `HX711` | **HX711 Load Cell Amplifier & 24-bit ADC** | Vi mạch tích hợp tiền khuếch đại điện áp và chuyển đổi tương tự - số độ phân giải cao 24-bit chuyên dụng cho cảm biến cân. | *Chương 2, 3, 4, 5* |
| 12 | `ADC` | **Analog-to-Digital Converter** | Bộ chuyển đổi tín hiệu tương tự sang tín hiệu số, cụ thể là vi mạch 24-bit HX711 lấy mẫu dữ liệu cân nặng ở tần số 10 Hz - 80 Hz. | *Chương 2, 3, 4* |
| 13 | `DOUT` | **Data Out** | Chân xuất dữ liệu nối tiếp 24-bit của chip ADC HX711 sang chân GPIO của Raspberry Pi. | *Chương 2, 3* |
| 14 | `SCK / PD_SCK` | **Power Down & Serial Clock Input** | Chân xung nhịp đồng hồ điều khiển dịch 24 bit dữ liệu và điều khiển chế độ ngủ tiết kiệm nguồn của chip HX711. | *Chương 2, 3* |
| 15 | `DVDD` | **Digital Power Supply Voltage** | Chân điện áp cấp nguồn cho khối mạch số logic của chip ADC HX711 (2,6V - 5,5V). | *Chương 3* |
| 16 | `ToF` | **Time of Flight** | Nguyên lý đo khoảng cách bằng cách đo thời gian bay khứ hồi của chùm tia photon ánh sáng phát ra và phản xạ trở lại. | *Chương 1, 2, 3, 4, 5* |
| 17 | `VL53L0X` | **VL53L0X Time-of-Flight Ranging Sensor** | Module cảm biến đo khoảng cách laser ToF của STMicroelectronics sử dụng giám sát chuyển động đưa tay qua miệng giỏ xe. | *Chương 2, 3, 4, 5* |
| 18 | `VCSEL` | **Vertical-Cavity Surface-Emitting Laser** | Bộ phát laser bề mặt khoang thẳng đứng bước sóng hồng ngoại an toàn 940 nm tích hợp bên trong cảm biến VL53L0X. | *Chương 2* |
| 19 | `SPAD` | **Single Photon Avalanche Diode** | Mảng diode thác quang điện tử đơn photon độ nhạy cực cao dùng thu nhận xung laser phản xạ trong cảm biến ToF. | *Chương 2* |
| 20 | `XSHUT` | **External Shutdown Pin** | Chân điều khiển ngắt/bật nguồn logic của VL53L0X, dùng để bật tuần tự từng cảm biến nhằm cấu hình lại địa chỉ I2C độc lập. | *Chương 2, 3* |
| 21 | `GM65` | **GM65 Optical Barcode & QR Reader Module** | Module mắt đọc mã vạch 1D và QR Code 2D CMOS quang học, đóng vai trò cứu hộ (Fallback) khi camera AI bị che khuất. | *Chương 1, 2, 3, 4, 5* |
| 22 | `CAM0 / CAM2` | **Camera 0 / Camera 2** | Định danh cụm 2 camera UVC góc rộng gắn đối xứng hai bên thành xe để quan sát bao quát toàn bộ miệng giỏ hàng. | *Chương 3, 4* |
| 23 | `CSI` | **Camera Serial Interface** | Chuẩn giao diện nối tiếp tốc độ cao của liên minh MIPI dùng cắm camera chuyên dụng trực tiếp vào bo mạch Raspberry Pi. | *Chương 3* |
| 24 | `UVC` | **USB Video Class** | Chuẩn giao thức kết nối thiết bị video qua cổng USB tiêu chuẩn không cần cài driver riêng, tương thích hoàn toàn với Linux V4L2. | *Chương 3* |
| 25 | `V4L2` | **Video4Linux2** | Hệ thống driver và khung API xử lý video thu nhận thời gian thực trên nhân hệ điều hành Linux của Raspberry Pi. | *Chương 3, 4* |
| 26 | `MJPG` | **Motion JPEG** | Định dạng luồng video nén khung hình JPEG qua cổng USB UVC, giúp giảm tải băng thông truyền nhận trên bus USB của Pi 4. | *Chương 3* |
| 27 | `TPU` | **Tensor Processing Unit** | Bộ xử lý gia tốc tensor phần cứng chuyên dụng (ví dụ Google Coral Edge TPU) dùng gia tốc mạng nơ-ron học sâu. | *Chương 5* |
| 28 | `NPU` | **Neural Processing Unit** | Bộ vi xử lý thần kinh chuyên dụng xử lý các phép toán nơ-ron AI với hiệu suất năng lượng vượt trội. | *Chương 5* |
| 29 | `CPU` | **Central Processing Unit** | Bộ vi xử lý trung tâm của trạm biên Raspberry Pi 4 Model B (4 nhân ARM Cortex-A72). | *Chương 2, 4* |
| 30 | `GPU` | **Graphics Processing Unit** | Bộ vi xử lý đồ họa (VideoCore VI trên Pi 4 và card đồ họa chuyên dụng trên máy chủ huấn luyện AI). | *Chương 2, 4* |
| 31 | `RAM` | **Random Access Memory** | Bộ nhớ truy xuất ngẫu nhiên tạm thời của hệ thống (Pi 4 trang bị RAM 8 GB LPDDR4, Server trang bị 16 GB DDR4). | *Chương 2, 3, 4* |
| 32 | `LPDDR4` | **Low-Power Double Data Rate 4** | Chuẩn bộ nhớ RAM thế hệ 4 tiết kiệm năng lượng tích hợp trên bo mạch Raspberry Pi 4 Model B. | *Chương 4* |
| 33 | `DDR4` | **Double Data Rate 4** | Chuẩn bộ nhớ RAM tốc độ cao của máy tính chủ Backend. | *Chương 4* |
| 34 | `SSD` | **Solid State Drive** | Ổ cứng thể rắn tốc độ cao trên máy chủ Backend lưu trữ cơ sở dữ liệu quan hệ PostgreSQL. | *Chương 4* |
| 35 | `NVMe` | **Non-Volatile Memory Express** | Giao thức truyền dữ liệu ổ cứng thể rắn qua bus PCIe tốc độ cao, tối ưu hóa thông lượng truy xuất CSDL máy chủ. | *Chương 4* |
| 36 | `GND` | **Ground** | Chân nối đất / mức điện thế tham chiếu 0V trong sơ đồ mạch điện xe đẩy. | *Chương 3* |
| 37 | `IC` | **Integrated Circuit** | Mạch tích hợp / vi mạch bán dẫn. | *Chương 2, 3* |

---

### NHÓM 3: CHUẨN GIAO TIẾP & GIAO THỨC TRUYỀN THÔNG (COMMUNICATION & NETWORKING PROTOCOLS)

> *Các chuẩn bus truyền thông nối tiếp nhúng và giao thức truyền thông mạng liên kết giữa các thiết bị ngoại vi, trạm biên và máy chủ.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `I2C` | **Inter-Integrated Circuit** | Chuẩn truyền thông nối tiếp đồng bộ 2 dây gồm đường dữ liệu SDA và xung nhịp SCL, chia sẻ chung bus kết nối 3 cảm biến ToF. | *Chương 1, 2, 3* |
| 2 | `SDA` | **Serial Data Line** | Đường truyền tín hiệu dữ liệu hai chiều trong chuẩn giao tiếp nối tiếp I2C. | *Chương 3* |
| 3 | `SCL` | **Serial Clock Line** | Đường truyền tín hiệu xung nhịp đồng hồ đồng bộ trong chuẩn giao tiếp nối tiếp I2C. | *Chương 3* |
| 4 | `UART` | **Universal Asynchronous Receiver-Transmitter** | Bộ truyền nhận nối tiếp bất đồng bộ qua hai chân truyền TX và nhận RX, kết nối module GM65 ở baudrate 9600 bps. | *Chương 1, 2, 3, 4* |
| 5 | `USB` | **Universal Serial Bus** | Chuẩn giao tiếp bus nối tiếp đa năng kết nối 2 camera UVC và mắt quét GM65 vào 4 cổng USB của Raspberry Pi 4. | *Chương 2, 3, 4* |
| 6 | `USB VCom` | **USB Virtual COM Port** | Chế độ giao tiếp cổng nối tiếp ảo qua kết nối cáp USB của đầu quét mã vạch GM65. | *Chương 2* |
| 7 | `Wi-Fi` | **Wireless Fidelity** | Mạng truyền thông không dây cục bộ nội bộ siêu thị kết nối xe đẩy với máy chủ Backend. | *Chương 4* |
| 8 | `IEEE 802.11ac` | **IEEE 802.11ac (Wi-Fi 5)** | Chuẩn mạng không dây tốc độ cao băng tần kép 5 GHz, đảm bảo thời gian Ping khứ hồi trung bình dưới 3 ms. | *Chương 4* |
| 9 | `Ping / RTT` | **Packet Internet Groper / Round-Trip Time** | Thước đo thời gian trễ khứ hồi của gói tin mạng truyền qua lại giữa Raspberry Pi và máy chủ Backend. | *Chương 4* |
| 10 | `HTTP / HTTPS` | **Hypertext Transfer Protocol / Secure** | Giao thức truyền tải siêu văn bản an toàn dùng cho kết nối trao đổi dữ liệu REST API giữa client và server. | *Chương 3, 4* |
| 11 | `WebSocket` | **WebSocket Protocol** | Giao thức truyền thông song công toàn phần (Full-duplex) 2 chiều liên tục qua kênh TCP, đề xuất để hạ trễ cập nhật giỏ hàng xuống dưới 50 ms. | *Chương 5* |
| 12 | `MQTT` | **Message Queuing Telemetry Transport** | Giao thức truyền thông điệp siêu nhẹ dạng Publish/Subscribe dành riêng cho các thiết bị IoT trong điều kiện mạng hạn chế. | *Chương 5* |
| 13 | `ThingsBoard Cloud` | **ThingsBoard IoT Cloud Platform** | Nền tảng đám mây IoT mã nguồn mở phục vụ thu thập dữ liệu viễn trắc telemetry, vẽ biểu đồ hành trình và giám sát xe đẩy từ xa. | *Chương 3, 5* |

---

### NHÓM 4: PHẦN MỀM BACKEND, CƠ SỞ DỮ LIỆU & KIẾN TRÚC HỆ THỐNG (BACKEND, DATABASE & ARCHITECTURE)

> *Các công nghệ máy chủ trung tâm, hệ quản trị cơ sở dữ liệu quan hệ, mẫu thiết kế kiến trúc và chuẩn mực bảo đảm toàn vẹn giao dịch.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `Backend` | **Backend Server Tier** | Tầng máy chủ trung tâm đảm nhiệm xử lý logic đối soát đa cảm biến, tính toán hóa đơn, thanh toán và quản trị CSDL. | *Chương 1, 3, 4, 5* |
| 2 | `FastAPI` | **FastAPI Framework** | Framework máy chủ web Python bất đồng bộ hiện đại hiệu năng cao, xây dựng hệ thống 6 endpoints tiếp nhận telemetry và ra phán quyết giỏ hàng. | *Chương 3, 4, 5* |
| 3 | `ASGI` | **Asynchronous Server Gateway Interface** | Chuẩn giao diện cổng máy chủ web bất đồng bộ trong Python (chạy trên Uvicorn), hỗ trợ xử lý hàng nghìn kết nối đồng thời từ các xe đẩy. | *Chương 4* |
| 4 | `ProcessTimeMiddleware` | **FastAPI ProcessTime Middleware** | Lớp phần mềm trung gian tại máy chủ FastAPI tính toán chính xác vi sai thời gian xử lý nội bộ của API đối soát. | *Chương 4* |
| 5 | `PostgreSQL` | **PostgreSQL Relational Database** | Hệ quản trị CSDL quan hệ đối tượng mã nguồn mở mạnh mẽ, lưu trữ CSDL stroller_db chuẩn hóa 3NF gồm 6 bảng nghiệp vụ cốt lõi. | *Chương 3, 4, 5* |
| 6 | `CSDL` | **Cơ sở dữ liệu (Database)** | Hệ thống lưu trữ dữ liệu tập trung quản lý thông tin phiên mua hàng, danh mục sản phẩm, chi tiết giỏ hàng và lịch sử giao dịch. | *Chương 3, 5* |
| 7 | `SQL` | **Structured Query Language** | Ngôn ngữ truy vấn có cấu trúc dùng để thao tác, truy vấn và cập nhật dữ liệu trong CSDL quan hệ PostgreSQL. | *Chương 3* |
| 8 | `SQLite` | **SQLite Embedded Database** | Hệ quản trị CSDL nhúng siêu nhẹ lưu cục bộ trên thẻ nhớ Pi 4 làm hàng đợi ngoại tuyến (Offline Journal) khi mạng Wi-Fi bị ngắt. | *Chương 3, 4* |
| 9 | `ACID` | **Atomicity, Consistency, Isolation, Durability** | Bốn thuộc tính toàn vẹn giao dịch của CSDL quan hệ: Nguyên tử, Nhất quán, Cô lập và Bền vững; bảo đảm đơn hàng không bị lỗi nửa chừng. | *Chương 3, 5* |
| 10 | `Idempotency` | **Idempotence / Idempotency** | Tính lũy đẳng: cơ chế xử lý gói tin có mã khóa duy nhất, đảm bảo nếu xe đẩy gửi lặp lại một sự kiện thì hệ thống vẫn chỉ ghi nhận đúng 1 lần. | *Chương 3, 5* |
| 11 | `UPSERT` | **Update or Insert (ON CONFLICT DO UPDATE)** | Kỹ thuật trong câu lệnh SQL PostgreSQL: nếu sản phẩm đã có trong giỏ hàng thì tăng số lượng, nếu chưa có thì chèn mới, bảo đảm tính bất biến. | *Chương 3* |
| 12 | `UNIQUE` | **UNIQUE SQL Constraint** | Ràng buộc duy nhất trên cột client_event_id của CSDL PostgreSQL, triệt tiêu hoàn toàn rủi ro cộng trùng sản phẩm khi mạng gửi lặp. | *Chương 4* |
| 13 | `UUID / ID` | **Universally Unique Identifier** | Chuỗi mã định danh duy nhất toàn cầu 128-bit, dùng gán mã phiên session_id và mã sự kiện giỏ hàng client_event_id. | *Chương 3* |
| 14 | `Transactional Outbox Pattern` | **Transactional Outbox Pattern** | Mẫu thiết kế kiến trúc phân tán đảm bảo các sự kiện cập nhật giỏ hàng và tin nhắn thông báo được gửi đi tin cậy mà không mất mát. | *Chương 5* |
| 15 | `Redis` | **Remote Dictionary Server** | Hệ thống lưu trữ cấu trúc dữ liệu khóa - giá trị trên bộ nhớ RAM (In-Memory Cache), đề xuất bổ sung để hạ độ trễ Backend xuống dưới 15 ms. | *Chương 5* |
| 16 | `Mock Bank` | **Simulated Banking Server** | Máy chủ ngân hàng giả lập (chạy cổng 4000) mô phỏng quy trình xử lý thanh toán và bắn Webhook xác nhận giao dịch trong phòng thí nghiệm. | *Chương 5* |
| 17 | `API` | **Application Programming Interface** | Giao diện lập trình ứng dụng: tập hợp các endpoint RESTful do FastAPI cung cấp để kết nối thiết bị biên và giao diện. | *Chương 1, 3, 4* |
| 18 | `REST / RESTful` | **Representational State Transfer** | Kiến trúc thiết kế dịch vụ web chuẩn mực sử dụng phương thức HTTP có định dạng dữ liệu truyền nhận dạng JSON. | *Chương 3* |
| 19 | `JSON` | **JavaScript Object Notation** | Định dạng trao đổi dữ liệu dạng chuỗi văn bản tiêu chuẩn trong các gói tin REST API giữa Raspberry Pi, Backend và Tablet App. | *Chương 3* |
| 20 | `SDK` | **Software Development Kit** | Bộ công cụ phát triển phần mềm kết nối do các đơn vị cung cấp cổng thanh toán số (VNPay, MoMo, ZaloPay) phát hành. | *Chương 5* |
| 21 | `DevOps` | **Development and Operations** | Phương pháp kết hợp phát triển và vận hành hệ thống: quản lý dịch vụ nền, Docker, ThingsBoard và đường hầm mạng Ngrok. | *Chương 3* |

---

### NHÓM 5: GIAO DIỆN NGƯỜI DÙNG, ỨNG DỤNG DI ĐỘNG & NỀN TẢNG WEB (FRONTEND, MOBILE & WEB)

> *Các công nghệ lập trình giao diện Tablet trên xe đẩy, ứng dụng web quản trị siêu thị và cổng ứng dụng web di động phục vụ khách hàng.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `Frontend` | **Frontend Client Tier** | Tầng ứng dụng giao diện tương tác trực tiếp với người dùng bao gồm App Tablet trên xe, Web Admin và Web PWA. | *Chương 1, 3* |
| 2 | `UI` | **User Interface** | Giao diện đồ họa người dùng hiển thị thông tin sản phẩm, giỏ hàng, thông báo lỗi và hóa đơn thanh toán. | *Chương 3, 4* |
| 3 | `Tablet App` | **Tablet Application** | Ứng dụng Android chạy trên máy tính bảng gắn trên tay đẩy xe đẩy, cung cấp giao diện giỏ hàng số hóa thời gian thực cho người mua. | *Chương 1, 3, 4, 5* |
| 4 | `MVVM` | **Model – View – ViewModel** | Kiến trúc thiết kế phần mềm ứng dụng Android Tablet, phân tách rạch ròi giữa giao diện UI, tầng quản lý trạng thái và tầng dữ liệu. | *Chương 3* |
| 5 | `ViewModel` | **Architecture Component ViewModel** | Thành phần kiến trúc trong Android Jetpack lưu trữ và quản lý trạng thái dữ liệu UI, tồn tại độc lập qua các vòng đời màn hình. | *Chương 3* |
| 6 | `StateFlow` | **Kotlin Coroutines StateFlow** | Luồng dữ liệu trạng thái bất biến có nhận thức vòng đời trong Kotlin, tự động phát tín hiệu cập nhật giao diện mỗi khi giỏ hàng biến động. | *Chương 3* |
| 7 | `Jetpack Compose` | **Android Jetpack Compose** | Bộ công cụ hiện đại của Google xây dựng giao diện Android dạng khai báo (Declarative UI), tối ưu hóa hiệu năng render đồ họa. | *Chương 4* |
| 8 | `LazyColumn` | **Jetpack Compose LazyColumn** | Thành phần danh sách cuộn tải động trong Jetpack Compose, chỉ dựng các phần tử hiển thị trên màn hình giúp App giỏ hàng chạy mượt mà. | *Chương 3, 4* |
| 9 | `LazyListState` | **LazyListState Holder** | Đối tượng quản lý trạng thái cuộn của LazyColumn, kết hợp derivedStateOf để ngăn chặn hiện tượng vẽ lại giao diện không cần thiết. | *Chương 4* |
| 10 | `RenderThread` | **Android RenderThread** | Luồng dựng hình chuyên trách cấp hệ điều hành Android tiếp nhận lệnh vẽ và tương tác trực tiếp với phần cứng GPU. | *Chương 4* |
| 11 | `VSync` | **Vertical Synchronization** | Đồng bộ khung hình dọc: tín hiệu phần cứng đồng bộ tốc độ dựng hình của GPU với tần số quét của màn hình máy tính bảng (60 Hz). | *Chương 4* |
| 12 | `Web Admin` | **Web Administration Platform** | Nền tảng web quản trị siêu thị (xây dựng bằng Next.js 14) dành cho nhân viên theo dõi dòng tiền, đơn hàng, kho bãi và vị trí xe đẩy. | *Chương 3, 5* |
| 13 | `Next.js 14` | **Next.js 14 Framework** | Framework React hiện đại hỗ trợ kiến trúc kết xuất phía máy chủ (App Router), tối ưu hóa tốc độ tải trang Web Admin. | *Chương 3* |
| 14 | `Tailwind CSS / CSS` | **Tailwind Cascading Style Sheets** | Bộ công cụ định kiểu giao diện web tiện ích dạng utility-first, giúp tối ưu hóa giao diện trang quản trị siêu thị. | *Chương 3* |
| 15 | `PWA` | **Progressive Web App** | Ứng dụng web cấp tiến dành cho khách hàng: giao diện web di động có khả năng cài đặt như ứng dụng native, tích điểm và quét mã hội viên. | *Chương 3, 5* |
| 16 | `QR / VietQR` | **Quick Response Code / VietQR** | Mã ma trận 2D phản hồi nhanh; dùng để quét mã hội viên trên PWA và xuất mã chuyển khoản ngân hàng tự động VietQR Napas 24/7. | *Chương 3, 5* |

---

### NHÓM 6: THUẬT NGỮ NGHIỆP VỤ BÁN LẺ, ĐƠN VỊ ĐO LƯỜNG & THỐNG KÊ KIỂM THỬ (RETAIL METRICS & EVALUATION)

> *Các chỉ số đánh giá nghiệp vụ bán lẻ, mã vạch tiêu chuẩn, phân vị độ trễ đo kiểm, các sự kiện chuyển đổi trạng thái và mã ca kiểm thử.*

| STT | Từ viết tắt / Ký hiệu | Thuật ngữ tiếng Anh đầy đủ | Ý nghĩa / Định nghĩa kỹ thuật trong đề tài | Chương |
| :---: | :---: | :--- | :--- | :---: |
| 1 | `SKU` | **Stock Keeping Unit** | Mã phân loại đơn vị hàng hóa độc nhất trong kho và quầy kệ siêu thị (ví dụ 5 SKU: Poca, Sữa đặc, Sữa Vina, Khăn ướt, Cà phê G7). | *Chương 2, 3, 4, 5* |
| 2 | `RPC` | **Retail Product Checkout Dataset** | Tập dữ liệu chuẩn phục vụ nghiên cứu bài toán nhận diện và đếm nhiều sản phẩm tại quầy thanh toán tự động. | *Chương 2* |
| 3 | `RP2K` | **Retail Product 2000 Dataset** | Tập dữ liệu thị giác bán lẻ quy mô lớn gồm hơn 2.000 sản phẩm có bao bì và hình thái gần giống nhau. | *Chương 2* |
| 4 | `SKU-110K` | **Stock Keeping Unit 110K Dataset** | Tập dữ liệu chuẩn nghiên cứu phát hiện vật thể mật độ dày đặc với hơn 110.000 danh mục sản phẩm. | *Chương 2* |
| 5 | `IncreACO` | **Incremental Automated Checkout** | Phương pháp thanh toán tự động học tăng cường, giúp cập nhật lớp sản phẩm mới mà không làm suy giảm chất lượng các lớp cũ. | *Chương 2* |
| 6 | `KPI` | **Key Performance Indicator** | Các chỉ số đo lường hiệu quả kinh doanh cốt lõi (Doanh thu hôm nay, Số đơn hàng, Lượt khách) hiển thị trên Dashboard của Web Admin. | *Chương 3* |
| 7 | `SLA` | **Service Level Agreement** | Cam kết mức dịch vụ: ngưỡng thời gian tối đa hệ thống cho phép phản hồi (chuẩn nội bộ Backend SLA dưới 50 ms và ngưỡng cảm nhận dưới 100 ms). | *Chương 4* |
| 8 | `P50` | **50th Percentile (Median)** | Phân vị thời gian trễ 50% (Trung vị): 50% số yêu cầu phản hồi nhanh hơn mốc này (đạt 24,8 ms ở Backend và 12,4 ms ở UI). | *Chương 4* |
| 9 | `P90 / P95` | **90th / 95th Percentile** | Phân vị thời gian trễ 90% và 95%: mốc đo lường thời gian đáp ứng của hệ thống dưới điều kiện tải cao (đạt 38,2 ms và 43,5 ms). | *Chương 4* |
| 10 | `P99` | **99th Percentile** | Phân vị thời gian trễ 99%: phản ánh trường hợp trễ xấu nhất ở đuôi phân phối (Backend đạt 58,1 ms, nằm an toàn dưới ngưỡng 100 ms). | *Chương 4, 5* |
| 11 | `MAE` | **Mean Absolute Error** | Sai số tuyệt đối trung bình: chỉ số thống kê đo mức độ sai lệch trọng lượng của cảm biến cân Loadcell qua các lần lặp lại. | *Chương 4* |
| 12 | `R_ToF` | **ToF Detection Rate** | Tỷ lệ phát hiện đúng chuyển động tay của cụm cảm biến khoảng cách ToF. | *Chương 4* |
| 13 | `TC / TC-01 -> TC-05` | **Test Case** | Mã định danh 5 ca kiểm thử tích hợp chức năng kịch bản: Happy Path, Lệch cân, AI mờ, Cứu hộ GM65, Rớt mạng. | *Chương 4* |
| 14 | `Sensor Fusion` | **Sensor Data Fusion** | Thuật toán hợp nhất dữ liệu đa cảm biến (Camera AI + Cân Loadcell + ToF) để ra quyết định cập nhật giỏ hàng chính xác 100%. | *Chương 1, 3, 5* |
| 15 | `ACK` | **Acknowledgment** | Gói tin tín hiệu xác nhận phản hồi thành công trong luồng giao tiếp giữa Backend, Pi và Tablet. | *Chương 3, 4* |
| 16 | `ADD` | **Action: ADD** | Thao tác khách hàng chọn sản phẩm bỏ vào lòng xe đẩy (khối lượng giỏ hàng tăng Delta W > 0). | *Chương 3, 4* |
| 17 | `REMOVE` | **Action: REMOVE** | Thao tác khách hàng lấy sản phẩm ra khỏi xe đẩy (khối lượng giỏ hàng giảm Delta W < 0). | *Chương 3, 4* |
| 18 | `ENTER` | **Event: ENTER** | Mốc thời gian cảm biến ToF phát hiện tay/hàng bắt đầu đi vào vùng miệng giỏ hàng. | *Chương 3, 4* |
| 19 | `CLEAR` | **Event: CLEAR** | Mốc thời gian cảm biến ToF phát hiện tay đã rút hoàn toàn khỏi miệng giỏ hàng, kích hoạt chốt cân và chụp ảnh. | *Chương 3, 4* |
| 20 | `EAN / EAN-13` | **European Article Number 13** | Chuẩn mã vạch sản phẩm quốc tế gồm 13 chữ số in trên bao bì hàng hóa siêu thị. | *Chương 1, 3, 4* |
| 21 | `USD` | **United States Dollar** | Đô la Mỹ: đơn vị tiền tệ trích dẫn trong nghiên cứu thiệt hại do hàng đợi thanh toán của Adyen (37,7 tỷ USD). | *Chương 1* |
| 22 | `kg` | **Kilogram** | Kilôgam: đơn vị đo khối lượng tiêu chuẩn (tải trọng định mức của bàn cân là 10 kg). | *Chương 1* |
| 23 | `GB` | **Gigabyte** | Đơn vị đo dung lượng bộ nhớ RAM (1 GB = 1.024 MB). | *Chương 2, 3, 4* |
| 24 | `MB` | **Megabyte** | Đơn vị đo dung lượng tệp tin và mô hình trọng số. | *Chương 2, 3, 4* |
| 25 | `KB` | **Kilobyte** | Đơn vị đo dung lượng dữ liệu nhỏ. | *Chương 4* |
| 26 | `GHz` | **Gigahertz** | Đơn vị đo tần số xung nhịp vi xử lý và sóng vô tuyến Wi-Fi. | *Chương 4* |
| 27 | `CSV` | **Comma-Separated Values** | Định dạng tệp dữ liệu phân tách bằng dấu phẩy lưu trữ cấu hình trọng lượng và số liệu kiểm thử. | *Chương 3* |
| 28 | `ZIP` | **ZIP Archive** | Định dạng nén tệp tin chứa bộ dữ liệu 4.826 ảnh xuất từ nền tảng Roboflow. | *Chương 3* |
| 29 | `SHA256` | **Secure Hash Algorithm 256-bit** | Thuật toán băm an toàn 256-bit dùng để kiểm tra tính toàn vẹn và xác thực chữ ký của mô hình AI. | *Chương 4* |

---
