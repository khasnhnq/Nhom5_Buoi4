# Cross-Chain Bridge - MSSV 104087

## 1. Cài đặt

Cài đặt package cho project:

```bash
npm install
```

Build smart contract:

```bash
npx hardhat build
```

Cài đặt frontend:

```bash
cd frontend
npm install
cd ..
```

---

## 2. Chạy Chain A

Mở Terminal 1 tại thư mục gốc project:

```bash
npx hardhat node --port 8547
```

Thông tin Chain A:

- RPC: http://127.0.0.1:8547
- Chain ID: 31337

Giữ Terminal 1 chạy.

---

## 3. Chạy Chain B

Mở Terminal 2:

```bash
npx hardhat node --port 8548 --config hardhat.config.chainB.ts
```

Thông tin Chain B:

- RPC: http://127.0.0.1:8548
- Chain ID: 31338

Giữ Terminal 2 chạy.

---

## 4. Deploy contract

Sau khi Chain A và Chain B đã chạy, mở một terminal mới:

```bash
npx hardhat run scripts/deploy-two-chains.ts
```

Sau khi deploy, địa chỉ các contract được lưu trong:

```text
deployed.json
```

Nếu địa chỉ contract thay đổi sau khi deploy lại, cập nhật địa chỉ tương ứng trong:

```text
frontend/src/config.ts
```

---

## 5. Cấu hình Relayer

Tạo file `.env` dựa trên `.env.example`.

Ví dụ:

```env
RPC_A=http://127.0.0.1:8547
RPC_B=http://127.0.0.1:8548

SOURCE_BRIDGE=<SOURCE_BRIDGE_ADDRESS>
DEST_BRIDGE=<DESTINATION_BRIDGE_ADDRESS>

RELAYER_PRIVATE_KEY=<RELAYER_PRIVATE_KEY>
```

Không đưa file `.env` chứa private key thật lên GitHub.

---

## 6. Chạy Relayer

Mở Terminal 3:

```bash
node relayer/index.js
```

Khi chạy thành công sẽ xuất hiện:

```text
RELAYER MSSV 104087 DANG CHAY
BAT DAU QUET BU EVENT CU
QUET BU HOAN TAT
Dang cho event TokensLocked...
```

Giữ Terminal 3 chạy.

---

## 7. Chạy Frontend

Mở Terminal 4:

```bash
cd frontend
npm run dev
```

Sau đó mở trình duyệt tại:

```text
http://localhost:5173/
```

Giữ Terminal 4 chạy.

---

## 8. Cấu hình MetaMask

Thêm mạng Chain A vào MetaMask:

- Network Name: Chuoi A (local)
- RPC URL: http://127.0.0.1:8547
- Chain ID: 31337
- Currency Symbol: ETH

Import Account #0 của Hardhat bằng private key được hiển thị khi chạy Chain A.

Chỉ sử dụng tài khoản Hardhat local cho mục đích học tập.

---

## 9. Chuyển token từ Chain A sang Chain B

Trên giao diện web:

1. Bấm `Ket noi vi`.
2. Cho phép MetaMask kết nối.
3. Kiểm tra địa chỉ ví và số dư TLB.
4. Nhập số lượng token cần chuyển.
5. Bấm `Chuyen sang chuoi B`.
6. Xác nhận giao dịch `Approve` trên MetaMask.
7. Xác nhận giao dịch `Lock` trên MetaMask.
8. Chờ Relayer xử lý.
9. Khi thành công, giao diện hiển thị:

```text
Hoan tat! Token da co o chuoi B.
```

Sau khi hoàn tất:

- Số dư TLB trên Chain A giảm.
- Số dư wTLB trên Chain B tăng.

---

## 10. Thứ tự chạy đầy đủ

Hệ thống cần 5 thành phần hoạt động:

```text
1. Chain A
2. Chain B
3. Relayer
4. React Frontend
5. MetaMask trên Chain A
```

Thứ tự thực hiện:

```text
Chain A
   ↓
Chain B
   ↓
Deploy Contracts
   ↓
Relayer
   ↓
React Frontend
   ↓
MetaMask
   ↓
Chuyển token
```

Các terminal cần giữ:

```text
Terminal 1: Chain A - port 8547
Terminal 2: Chain B - port 8548
Terminal 3: Relayer
Terminal 4: React/Vite Frontend
MetaMask:   Chuoi A (local)
```

---

## 11. Xử lý lỗi người dùng hủy giao dịch

Nếu người dùng bấm Reject/Cancel trên MetaMask, giao diện sẽ hiển thị:

```text
Ban da huy giao dich.
```

---

## Tác giả

MSSV: 104087
