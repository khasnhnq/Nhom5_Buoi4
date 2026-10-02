# Cross-Chain Bridge - MSSV 104087

## 1. Cài đặt

Clone project và cài dependencies:

```bash
npm install
```

Build smart contract:

```bash
npx hardhat build
```

---

## 2. Khởi động Chain A

Mở Terminal 1:

```bash
npx hardhat node --port 8547
```

Giữ terminal này chạy.

Chain A:

- RPC: http://127.0.0.1:8547
- Chain ID: 31337

---

## 3. Khởi động Chain B

Mở Terminal 2:

```bash
npx hardhat node --port 8548 --config hardhat.config.chainB.ts
```

Giữ terminal này chạy.

Chain B:

- RPC: http://127.0.0.1:8548
- Chain ID: 31338

---

## 4. Deploy contract lên hai chain

Mở Terminal 3:

```bash
npx hardhat run scripts/deploy-two-chains.ts
```

Sau khi deploy thành công, địa chỉ contract được lưu trong:

```text
deployed.json
```

File này chứa địa chỉ:

- MyToken
- SourceBridge
- WrappedToken
- DestinationBridge
- Relayer

---

## 5. Cấu hình Relayer

Tạo file `.env` dựa trên:

```text
.env.example
```

Điền RPC của Chain A, Chain B, địa chỉ contract và private key của relayer.

Không commit file `.env` lên GitHub.

---

## 6. Chạy Relayer

Mở Terminal 3 hoặc một terminal mới:

```bash
npx tsx relayer/relayer.ts
```

Khi chạy thành công sẽ xuất hiện:

```text
Dang cho event TokensLocked...
```

Giữ terminal này chạy.

---

## 7. Lock 100 TLB trên Chain A

Mở Terminal 4:

```bash
npx tsx scripts/lock-100.ts
```

Kết quả mong đợi:

```text
Lock thanh cong!
So luong: 100.0 TLB
Destination Chain ID: 31338
```

Relayer sẽ nhận sự kiện `TokensLocked` và mint wrapped token trên Chain B.

Kết quả ở terminal Relayer:

```text
Dang mint wTLB tren Chain B...
Mint thanh cong: 100.0 wTLB
```

---

## 8. Kiểm tra số dư trên Chain B

Chạy:

```bash
npx tsx scripts/check-balance.ts
```

Kết quả mong đợi:

```text
So du: 100.0 wTLB
```

Điều này chứng minh 100 TLB đã được lock trên Chain A và 100 wTLB đã được mint trên Chain B.

---

## 9. Chạy test

Chạy:

```bash
npx hardhat test
```

Các test của `DestinationBridge` kiểm tra:

- Relayer có thể mint token.
- Người không phải relayer bị chặn (`NotRelayer`).
- Một `messageId` không thể xử lý hai lần (`AlreadyProcessed`).

Tất cả test phải ở trạng thái `passing`.

---

## Thứ tự chạy

```text
1. npm install
2. npx hardhat build
3. Khởi động Chain A - port 8547
4. Khởi động Chain B - port 8548
5. Deploy contract lên hai chain
6. Cấu hình .env
7. Chạy Relayer
8. Chạy scripts/lock-100.ts
9. Chạy scripts/check-balance.ts
10. Chạy npx hardhat test
```

## Các terminal cần giữ chạy

```text
Terminal 1: Chain A (8547)
Terminal 2: Chain B (8548)
Terminal 3: Relayer
Terminal 4: Dùng để lock token và kiểm tra balance
```
