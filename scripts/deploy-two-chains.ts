import { network } from "hardhat";
import fs from "fs";

async function main() {
  // =========================
  // CHAIN A
  // =========================
  const chainA = await network.connect("chainA");
  const ethersA = chainA.ethers;

  const [ownerA] = await ethersA.getSigners();

  console.log("Deploying Chain A...");

  const token = await ethersA.deployContract("MyToken");
  await token.waitForDeployment();

  const sourceBridge = await ethersA.deployContract("SourceBridge", [
    await token.getAddress(),
    ownerA.address,
  ]);
  await sourceBridge.waitForDeployment();

  // =========================
  // CHAIN B
  // =========================
  const chainB = await network.connect("chainB");
  const ethersB = chainB.ethers;

  const [ownerB, relayer] = await ethersB.getSigners();

  console.log("Deploying Chain B...");

  const wrapped = await ethersB.deployContract("WrappedToken", [
    ownerB.address,
  ]);
  await wrapped.waitForDeployment();

  const destinationBridge = await ethersB.deployContract("DestinationBridge", [
    await wrapped.getAddress(),
    ownerB.address,
  ]);
  await destinationBridge.waitForDeployment();

  // DestinationBridge duoc quyen mint WrappedToken
  await (
    await wrapped.transferOwnership(await destinationBridge.getAddress())
  ).wait();

  // Cho phep Account #1 lam relayer
  await (await destinationBridge.setRelayer(relayer.address, true)).wait();

  // =========================
  // LƯU ĐỊA CHỈ
  // =========================
  const deployed = {
    chainA: {
      token: await token.getAddress(),
      sourceBridge: await sourceBridge.getAddress(),
    },

    chainB: {
      wrapped: await wrapped.getAddress(),
      destinationBridge: await destinationBridge.getAddress(),
    },

    relayer: relayer.address,
  };

  fs.writeFileSync("deployed.json", JSON.stringify(deployed, null, 2));

  console.log("\n===== DEPLOYED =====");
  console.log(deployed);
  console.log("\nDa tao deployed.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
