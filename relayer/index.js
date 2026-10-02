import "dotenv/config";
import { ethers } from "ethers";

const rpcA = process.env.RPC_A;
const rpcB = process.env.RPC_B;
const sourceAddress = process.env.SOURCE_BRIDGE;
const destAddress = process.env.DEST_BRIDGE;
const privateKey = process.env.RELAYER_PRIVATE_KEY;

const providerA = new ethers.JsonRpcProvider(rpcA);
const providerB = new ethers.JsonRpcProvider(rpcB);

const walletB = new ethers.Wallet(privateKey, providerB);

const sourceAbi = [
  "event TokensLocked(bytes32 indexed messageId, address indexed from, address to, uint256 amount, uint256 destChainId)",
];

const destAbi = [
  "function mintFromSource(bytes32 messageId, address to, uint256 amount)",
  "function processed(bytes32 messageId) view returns (bool)",
];

const source = new ethers.Contract(sourceAddress, sourceAbi, providerA);

const destination = new ethers.Contract(destAddress, destAbi, walletB);

// ========================================
// HAM XU LY MOT EVENT TokensLocked
// ========================================
async function processEvent(messageId, from, to, amount, destChainId) {
  console.log("\n===== TokensLocked =====");
  console.log("messageId:", messageId);
  console.log("from:", from);
  console.log("to:", to);
  console.log("amount:", ethers.formatEther(amount), "TLB");
  console.log("destChainId:", destChainId.toString());

  // Kiem tra message da duoc xu ly tren Chain B chua
  const alreadyProcessed = await destination.processed(messageId);

  if (alreadyProcessed) {
    console.log("Message da duoc xu ly -> bo qua.");
    return;
  }

  console.log("Message chua duoc xu ly.");
  console.log("Dang mint wTLB tren Chain B...");

  const tx = await destination.mintFromSource(messageId, to, amount);

  console.log("tx:", tx.hash);

  await tx.wait();

  console.log("Mint thanh cong:", ethers.formatEther(amount), "wTLB");
}

// ========================================
// QUET BU CAC EVENT CU
// ========================================
async function backfill() {
  console.log("\n=================================");
  console.log(" BAT DAU QUET BU EVENT CU");
  console.log("=================================");

  const currentBlock = await providerA.getBlockNumber();

  console.log("Block hien tai Chain A:", currentBlock);

  // Quet lai cac event TokensLocked cu
  // Local Hardhat nen co the quet tu block 0
  const events = await source.queryFilter(
    source.filters.TokensLocked(),
    0,
    currentBlock
  );

  console.log("Tim thay", events.length, "event TokensLocked");

  for (const event of events) {
    if (!event.args) {
      continue;
    }

    const { messageId, from, to, amount, destChainId } = event.args;

    try {
      await processEvent(messageId, from, to, amount, destChainId);
    } catch (error) {
      console.error("Loi khi xu ly event cu:", error);
    }
  }

  console.log("\n=================================");
  console.log(" QUET BU HOAN TAT");
  console.log("=================================");
}

// ========================================
// MAIN
// ========================================
async function main() {
  console.log("=================================");
  console.log(" RELAYER MSSV 104087 DANG CHAY");
  console.log("=================================");

  console.log("SourceBridge:", sourceAddress);

  console.log("DestinationBridge:", destAddress);

  console.log("Relayer:", walletB.address);

  // B1: Quet lai event cu bi bo lo
  await backfill();

  // B2: Sau do lang nghe event moi
  console.log("\nDang cho event TokensLocked...");

  source.on(
    "TokensLocked",
    async (messageId, from, to, amount, destChainId) => {
      try {
        await processEvent(messageId, from, to, amount, destChainId);

        console.log("\nDang cho event tiep theo...");
      } catch (error) {
        console.error("Relayer error:", error);
      }
    }
  );
}

main().catch((error) => {
  console.error("Relayer khoi dong that bai:", error);

  process.exit(1);
});
