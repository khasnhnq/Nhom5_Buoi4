import { expect } from "chai";
import { network } from "hardhat";

describe("DestinationBridge", function () {
  async function deployFixture() {
    const { ethers } = await network.connect();

    const [owner, relayer, user, other] = await ethers.getSigners();

    // Deploy WrappedToken
    const wrapped = await ethers.deployContract("WrappedToken", [
      owner.address,
    ]);

    // Deploy DestinationBridge
    const bridge = await ethers.deployContract("DestinationBridge", [
      await wrapped.getAddress(),
      owner.address,
    ]);

    // Cho DestinationBridge quyen mint WrappedToken
    await wrapped.transferOwnership(await bridge.getAddress());

    // Cho phep account relayer
    await bridge.setRelayer(relayer.address, true);

    return {
      ethers,
      wrapped,
      bridge,
      owner,
      relayer,
      user,
      other,
    };
  }

  // =========================
  // TEST 1: Relayer mint thanh cong
  // =========================
  it("Relayer mint thanh cong", async function () {
    const { ethers, wrapped, bridge, relayer, user } = await deployFixture();

    const messageId = ethers.keccak256(ethers.toUtf8Bytes("message-104087-1"));

    const amount = ethers.parseEther("100");

    await bridge
      .connect(relayer)
      .mintFromSource(messageId, user.address, amount);

    expect(await wrapped.balanceOf(user.address)).to.equal(amount);
  });

  // =========================
  // TEST 2: Chan nguoi la
  // =========================
  it("Chan nguoi la - NotRelayer", async function () {
    const { ethers, bridge, user, other } = await deployFixture();

    const messageId = ethers.keccak256(ethers.toUtf8Bytes("message-104087-2"));

    const amount = ethers.parseEther("100");

    await expect(
      bridge.connect(other).mintFromSource(messageId, user.address, amount)
    ).to.be.revertedWithCustomError(bridge, "NotRelayer");
  });

  // =========================
  // TEST 3: Chan xu ly lap
  // =========================
  it("Chan xu ly lap - AlreadyProcessed", async function () {
    const { ethers, bridge, relayer, user } = await deployFixture();

    const messageId = ethers.keccak256(ethers.toUtf8Bytes("message-104087-3"));

    const amount = ethers.parseEther("100");

    // Xu ly lan dau
    await bridge
      .connect(relayer)
      .mintFromSource(messageId, user.address, amount);

    // Xu ly lai cung messageId -> phai revert
    await expect(
      bridge.connect(relayer).mintFromSource(messageId, user.address, amount)
    ).to.be.revertedWithCustomError(bridge, "AlreadyProcessed");
  });

  // =========================
  // TEST 4 - MC5.8
  // Pause phai chan mintFromSource
  // =========================
  it("Pause chan mintFromSource - EnforcedPause", async function () {
    const { ethers, bridge, owner, relayer, user } = await deployFixture();

    const messageId = ethers.keccak256(ethers.toUtf8Bytes("pause-test-104087"));

    const amount = ethers.parseEther("100");

    // Owner tam dung bridge
    await bridge.connect(owner).pause();

    // Kiem tra bridge dang pause
    expect(await bridge.paused()).to.equal(true);

    // Relayer thu mint khi bridge dang pause
    // -> phai bi revert
    await expect(
      bridge.connect(relayer).mintFromSource(messageId, user.address, amount)
    ).to.be.revertedWithCustomError(bridge, "EnforcedPause");
  });
});
