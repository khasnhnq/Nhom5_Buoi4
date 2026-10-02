import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [owner, user] = await ethers.getSigners();

  // Sau này biết công thức từ MSSV thì chỉ sửa dòng này
  const amount = 1000n;

  // Deploy token
  const token = await ethers.deployContract("MyToken");
  await token.waitForDeployment();

  // Deploy SourceBridge
  const bridge = await ethers.deployContract("SourceBridge", [
    await token.getAddress(),
    owner.address,
  ]);
  await bridge.waitForDeployment();

  // Chuyển token cho user
  await (await token.transfer(user.address, amount)).wait();

  // Cho phép Bridge lấy token
  await (
    await token.connect(user).approve(await bridge.getAddress(), amount)
  ).wait();

  // Gọi lock()
  const tx = await bridge.connect(user).lock(user.address, amount, 31338);

  const receipt = await tx.wait();

  console.log("===== DO-LOCK MSSV 104087 =====");
  console.log("MyToken:", await token.getAddress());
  console.log("SourceBridge:", await bridge.getAddress());
  console.log("Nguoi gui:", user.address);
  console.log("So luong token khoa:", amount.toString());

  // Đọc event TokensLocked
  for (const log of receipt!.logs) {
    try {
      const parsed = bridge.interface.parseLog(log);

      if (parsed?.name === "TokensLocked") {
        console.log("\n===== TokensLocked =====");
        console.log("messageId:", parsed.args.messageId);
        console.log("from:", parsed.args.from);
        console.log("to:", parsed.args.to);
        console.log("amount:", parsed.args.amount.toString());
        console.log("destChainId:", parsed.args.destChainId.toString());
      }
    } catch {
      // Bỏ qua log không thuộc SourceBridge
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
