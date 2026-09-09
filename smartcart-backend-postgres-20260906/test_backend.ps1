$ErrorActionPreference = "Stop"
$baseUrl = "http://127.0.0.1:8000"

Write-Host "1. Kiem tra backend"
Invoke-RestMethod -Method Get -Uri "$baseUrl/health" | ConvertTo-Json -Depth 6

Write-Host "2. Tao phien mua hang"
$session = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/sessions"
$session | ConvertTo-Json -Depth 6

Write-Host "3. Luu su kien GM65"
$barcodeEvent = @{
    session_id = $session.id
    source = "gm65"
    event_type = "barcode_scanned"
    barcode = "8935005801135"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/events" `
    -ContentType "application/json" -Body $barcodeEvent | Out-Null

Write-Host "4. Luu su kien Vision AI"
$visionEvent = @{
    session_id = $session.id
    source = "vision"
    event_type = "product_classified"
    ai_class = "lavie_500ml"
    ai_confidence = 0.947
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/events" `
    -ContentType "application/json" -Body $visionEvent | Out-Null

Write-Host "5. Gia lap HX711 va them La Vie vao gio"
$decision = @{
    session_id = $session.id
    action = "add"
    barcode = "8935005801135"
    ai_class = "lavie_500ml"
    ai_confidence = 0.947
    delta_weight_g = 500.0
    weight_source = "simulated"
} | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/v1/cart/decisions" `
    -ContentType "application/json" -Body $decision
$result | ConvertTo-Json -Depth 8

Write-Host "6. Doc gio hang tu SQLite"
Invoke-RestMethod -Method Get -Uri "$baseUrl/api/v1/cart/$($session.id)" |
    ConvertTo-Json -Depth 8

Write-Host "7. Trang thai hang doi ThingsBoard"
Invoke-RestMethod -Method Get -Uri "$baseUrl/api/v1/thingsboard/status" |
    ConvertTo-Json -Depth 8

Write-Host "HOAN TAT - Session ID: $($session.id)"

