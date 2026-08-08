import os

# Fix CartDetailScreen mistakes
cart_path = 'app/src/main/java/com/example/xedaythongminh/ui/screens/CartDetailScreen.kt'
with open(cart_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to revert the incorrect navigations and apply the right ones
# Line 275, 287 were increase/decrease, Line 312 was delete
content = content.replace('onClick = { navController.navigate("scan_product") },\n                        modifier = Modifier.size(28.dp).background(Color.White, CircleShape)', 'onClick = { /* TODO */ },\n                        modifier = Modifier.size(28.dp).background(Color.White, CircleShape)')

content = content.replace('onClick = { navController.navigate("payment_selection") },\n                modifier = Modifier.align(Alignment.TopEnd)', 'onClick = { /* TODO */ },\n                modifier = Modifier.align(Alignment.TopEnd)')

# Now apply the actual routing
content = content.replace('onClick = { /* TODO */ },\n                                modifier = Modifier\n                                    .weight(1f)\n                                    .height(56.dp),', 'onClick = { navController.navigate("scan_product") },\n                                modifier = Modifier\n                                    .weight(1f)\n                                    .height(56.dp),')

content = content.replace('onClick = { /* TODO */ },\n                                modifier = Modifier\n                                    .weight(1f)\n                                    .height(56.dp),\n                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),', 'onClick = { navController.navigate("payment_selection") },\n                                modifier = Modifier\n                                    .weight(1f)\n                                    .height(56.dp),\n                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),')

with open(cart_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed CartDetailScreen")

# Fix PaymentSelectionScreen mistake (it replaced 'Quay lại giỏ hàng' which was a TODO)
pay_sel_path = 'app/src/main/java/com/example/xedaythongminh/ui/screens/PaymentSelectionScreen.kt'
with open(pay_sel_path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('onClick = { /* TODO: Cancel */ }', 'onClick = { navController.navigate("cart_detail") }')
with open(pay_sel_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed PaymentSelectionScreen")

