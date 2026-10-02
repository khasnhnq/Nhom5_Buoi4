import { ethers } from "ethers";
import fs from "fs";

async function main() {
  // Doc dia chi contract da deploy
  const deployed = JSON.parse(fs.readFileSync("deployed.json", "utf8"));

  // Ket noi Chain A
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8547");

  // Account #0 cua Hardhat
  const signer = await provider.getSigner(0);

  const tokenAddress = deployed.chainA.token;
  const sourceBridgeAddress = deployed.chainA.sourceBridge;

  const tokenAbi = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
  ];

  const sourceBridgeAbi = [
    "function lock(address to, uint256 amount, uint256 destChainId)",
  ];

  const token = new ethers.Contract(tokenAddress, tokenAbi, signer);

  const sourceBridge = new ethers.Contract(
    sourceBridgeAddress,
    sourceBridgeAbi,
    signer
  );

  const userAddress = await signer.getAddress();

  // Khoa 100 token
  const amount = ethers.parseEther("100");

  console.log("===== LOCK 100 TLB =====");
  console.log("Nguoi gui:", userAddress);
  console.log("MyToken:", tokenAddress);
  console.log("SourceBridge:", sourceBridgeAddress);

  // Approve SourceBridge
  console.log("\nDang approve 100 TLB...");

  const approveTx = await token.approve(sourceBridgeAddress, amount);

  await approveTx.wait();

  console.log("Approve thanh cong.");

  // Goi lock()
  console.log("Dang lock 100 TLB...");

  const lockTx = await sourceBridge.lock(userAddress, amount, 31338);

  await lockTx.wait();

  console.log("Lock thanh cong!");
  console.log("So luong:", ethers.formatEther(amount), "TLB");
  console.log("Destination Chain ID: 31338");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
