import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const deployed = JSON.parse(fs.readFileSync("deployed.json", "utf8"));

  // Ket noi Chain B
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8548");

  // Account #0 la nguoi nhan trong lan lock vua roi
  const signer = await provider.getSigner(0);
  const userAddress = await signer.getAddress();

  const wrappedAddress = deployed.chainB.wrapped;

  const wrappedAbi = [
    "function balanceOf(address account) view returns (uint256)",
    "function symbol() view returns (string)",
  ];

  const wrapped = new ethers.Contract(wrappedAddress, wrappedAbi, provider);

  const balance = await wrapped.balanceOf(userAddress);
  const symbol = await wrapped.symbol();

  console.log("===== KIEM TRA SO DU CHAIN B =====");
  console.log("Vi:", userAddress);
  console.log("WrappedToken:", wrappedAddress);
  console.log("So du:", ethers.formatEther(balance), symbol);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
